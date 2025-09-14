"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { ProblemItem } from "../types";
import { useMemo } from "react";

interface GraphProps {
  problems: ProblemItem[];
}

export default function PerformanceSummaryGraph({ problems }: GraphProps) {
  const chartData = useMemo(() => {
    // Define the scaling factor for daily calls, as requested.
    const callsPerDay = 1000;

    return problems
      .filter((p) => p.status === "optimized" && p.optimizationResult != null)
      .map((p, index) => {
        const savings =
          p.optimizationResult?.cost_slayer.potential_savings || [];

        // Find the per-call saving for each provider.
        const awsSavingPerCall =
          savings.find((s) => s.provider_name === "AWS Athena")
            ?.potential_savings_inr_per_call || 0;
        const gcpSavingPerCall =
          savings.find((s) => s.provider_name === "Google BigQuery")
            ?.potential_savings_inr_per_call || 0;

        return {
          name: `Query ${index + 1}`,
          "Execution Time Before (ms)": p.execution_time_ms,
          "Execution Time After (ms)":
            p.optimizationResult?.estimated_execution_time_after_ms,
          "Data Scanned Before (MB)":
            p.optimizationResult?.ai_suggestion
              .estimated_data_scanned_before_mb,
          "Data Scanned After (MB)":
            p.optimizationResult?.ai_suggestion.estimated_data_scanned_after_mb,

          // Scale the per-call savings by the number of daily calls.
          "AWS Athena Savings (INR)": awsSavingPerCall * callsPerDay,
          "Google BigQuery Savings (INR)": gcpSavingPerCall * callsPerDay,
        };
      });
  }, [problems]);

  const validChartData = chartData.filter(
    (data) =>
      data["Execution Time Before (ms)"] !== undefined &&
      data["Execution Time After (ms)"] !== undefined
  );

  const hasSavingsData = validChartData.some(
    (data) =>
      data["AWS Athena Savings (INR)"] > 0 ||
      data["Google BigQuery Savings (INR)"] > 0
  );

  if (validChartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Optimization Performance Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No optimized queries with complete data available for summary.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Optimization Performance Summary</CardTitle>
        <CardDescription>
          Comparison of performance metrics for all optimized queries.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        <div>
          <h4 className="text-center font-semibold mb-4">
            Execution Time (ms)
          </h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={validChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Milliseconds (ms)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} ms`}
                contentStyle={{
                  backgroundColor: "#000",
                  borderColor: "#333",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="Execution Time Before (ms)" fill="#ef4444" />
              <Bar dataKey="Execution Time After (ms)" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-center font-semibold mb-4">Data Scanned (MB)</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={validChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Megabytes (MB)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} MB`}
                contentStyle={{
                  backgroundColor: "#000",
                  borderColor: "#333",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="Data Scanned Before (MB)" fill="#f97316" />
              <Bar dataKey="Data Scanned After (MB)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {hasSavingsData && (
          <div className="lg:col-span-2">
            <h4 className="text-center font-semibold mb-4">
              Potential Savings (for 1000 Daily Calls)
            </h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={validChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "Indian Rupee (₹)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                />
                <Tooltip
                  formatter={(value: number) =>
                    `₹${value.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                  contentStyle={{
                    backgroundColor: "#000",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="Google BigQuery Savings (INR)" fill="#4285F4" />
                <Bar dataKey="AWS Athena Savings (INR)" fill="#FF9900" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
