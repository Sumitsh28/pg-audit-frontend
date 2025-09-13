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
    return problems
      .filter((p) => p.status === "optimized" && p.optimizationResult != null)
      .map((p, index) => ({
        name: `Query ${index + 1}`,
        "Before (ms)": p.execution_time_ms,
        "After (ms)": p.optimizationResult?.estimated_execution_time_after_ms,
        "Before (cost)": p.optimizationResult?.cost_slayer.cost_before,
        "After (cost)": p.optimizationResult?.cost_slayer.cost_after,
      }));
  }, [problems]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Optimization Performance Summary</CardTitle>
        <CardDescription>
          Comparison of performance metrics for all optimized queries.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
        <div>
          <h4 className="text-center font-semibold mb-4">
            Execution Time (ms)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                }}
              />
              <Legend />
              <Bar dataKey="Before (ms)" fill="#ef4444" />
              <Bar dataKey="After (ms)" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-center font-semibold mb-4">Query Cost</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                }}
              />
              <Legend />
              <Bar dataKey="Before (cost)" fill="#f97316" />
              <Bar dataKey="After (cost)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
