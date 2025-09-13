"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CodeBlock } from "react-code-block";
import { ShieldCheck, ArrowRight } from "lucide-react";

// The fully updated interface
interface PerformanceIssue {
  id: number;
  query: string;
  avg_execution_time_ms: number | null;
  actual_execution_time_ms: number | null;
  estimated_execution_time_after_ms: number | null;
  ai_suggestion: {
    rewritten_query: string | null;
    new_index_suggestion: string | null;
    explanation: string;
  };
  cost_slayer: {
    cost_before: number;
    cost_after: number;
  };
}

export default function IssueCard({ issue }: { issue: PerformanceIssue }) {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ddlStatement =
    issue.ai_suggestion.new_index_suggestion ||
    issue.ai_suggestion.rewritten_query ||
    "";
  const timeBefore =
    issue.actual_execution_time_ms ?? issue.avg_execution_time_ms;

  const handleApply = async () => {
    const isConfirmed = window.confirm(
      "WARNING: This will apply a DDL change to your database. This action is irreversible. Are you absolutely sure?"
    );

    if (isConfirmed) {
      setIsApplying(true);
      setError(null);
      try {
        const dbUri = JSON.parse(sessionStorage.getItem("dbUri") || '""');
        const writeDbUri = dbUri; // In a real app, prompt for this securely.

        await axios.post("http://localhost:8000/apply", {
          db_uri: dbUri,
          write_db_uri: writeDbUri,
          ddl_statement: ddlStatement,
          original_query: issue.query,
        });
        alert("Fix applied successfully!");
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to apply the fix.");
      } finally {
        setIsApplying(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Explanation</h3>
        <p className="text-sm text-muted-foreground">
          {issue.ai_suggestion.explanation}
        </p>
      </div>

      {ddlStatement && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Suggested Fix</h3>
          <div className="rounded-md bg-slate-900 text-sm">
            <CodeBlock code={ddlStatement} language="sql" theme="dracula" />
          </div>
        </div>
      )}

      {/* --- NEW PERFORMANCE IMPACT SECTION --- */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Performance Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="font-semibold text-secondary-foreground">
              Before Fix
            </h4>
            <p className="text-2xl font-bold mt-1">
              {timeBefore ? `${timeBefore.toFixed(2)} ms` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              Query Cost: {issue.cost_slayer.cost_before.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-green-950 border border-green-800 rounded-lg">
            <h4 className="font-semibold text-green-400">
              After Fix (Estimated)
            </h4>
            <p className="text-2xl font-bold mt-1 text-green-400">
              ~
              {issue.estimated_execution_time_after_ms
                ? issue.estimated_execution_time_after_ms.toFixed(2)
                : "N/A"}{" "}
              ms
            </p>
            <p className="text-xs text-muted-foreground">
              Query Cost: {issue.cost_slayer.cost_after.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4 pt-4">
        <Button
          variant="destructive"
          onClick={handleApply}
          disabled={isApplying || !ddlStatement}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          {isApplying ? "Applying..." : "Apply Fix"}
        </Button>
      </div>
    </div>
  );
}
