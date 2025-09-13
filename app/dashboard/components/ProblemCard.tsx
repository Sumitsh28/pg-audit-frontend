"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Sparkles,
  Wand2,
  ShieldCheck,
  MessageSquarePlus,
} from "lucide-react";
import type { ProblemItem } from "../types";

interface ProblemCardProps {
  item: ProblemItem;
  onOptimize: () => void;
  onApply: (ddl: string) => void;
  onAskAI: () => void;
}

export default function ProblemCard({
  item,
  onOptimize,
  onApply,
  onAskAI,
}: ProblemCardProps) {
  const { query, execution_time_ms, calls, error, status, optimizationResult } =
    item;

  const ddlStatement =
    optimizationResult?.ai_suggestion.new_index_suggestion ||
    optimizationResult?.ai_suggestion.rewritten_query ||
    "";

  return (
    <Card className="overflow-hidden shadow-md">
      <CardHeader className="bg-secondary/50">
        <div className="flex justify-between items-start gap-4">
          <div className="font-mono text-sm text-secondary-foreground flex-grow">
            {query}
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            {status === "idle" && (
              <Button onClick={onOptimize} size="sm">
                <Sparkles className="mr-2 h-4 w-4" /> Optimize
              </Button>
            )}
            {status === "optimizing" && (
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Optimizing...
              </div>
            )}

            {status !== "optimizing" && (
              <Button variant="outline" size="sm" onClick={onAskAI}>
                <MessageSquarePlus className="mr-2 h-4 w-4" /> Ask AI
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {error && (
          <p className="text-destructive font-semibold">
            Error during benchmark: {error}
          </p>
        )}
        <div className="flex gap-4 text-sm">
          {execution_time_ms != null && (
            <p>
              Execution time:{" "}
              <strong className="text-amber-500">
                {execution_time_ms?.toFixed(2)} ms
              </strong>
            </p>
          )}
          {calls != null && (
            <p>
              Calls: <strong className="text-blue-400">{calls}</strong>
            </p>
          )}
        </div>

        {status === "optimized" && optimizationResult && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">AI Suggestion</h3>
            <p className="text-sm text-muted-foreground">
              {optimizationResult.ai_suggestion.explanation}
            </p>

            {ddlStatement ? (
              <div>
                <h4 className="text-sm font-semibold mb-2">Suggested Code:</h4>
                <div className="p-2 rounded-md bg-slate-950 font-mono text-xs">
                  <pre>
                    <code>
                      {optimizationResult.ai_suggestion.rewritten_query ||
                        optimizationResult.ai_suggestion.new_index_suggestion}
                    </code>
                  </pre>
                </div>
              </div>
            ) : (
              <Alert variant="default">
                <Wand2 className="h-4 w-4" />
                <AlertTitle>No Code Change Recommended</AlertTitle>
                <AlertDescription>
                  The AI concluded that the current query is already optimal.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-2 bg-secondary rounded">
                <h4 className="text-xs font-semibold">BEFORE</h4>
                <p className="font-bold">{execution_time_ms?.toFixed(2)} ms</p>
                <p className="text-xs text-muted-foreground">
                  Cost: {optimizationResult.cost_slayer.cost_before}
                </p>
              </div>
              <div className="p-2 bg-green-950 rounded border border-green-800">
                <h4 className="text-xs font-semibold text-green-400">
                  AFTER (EST.)
                </h4>
                <p className="font-bold text-green-400">
                  ~
                  {optimizationResult.estimated_execution_time_after_ms?.toFixed(
                    2
                  )}{" "}
                  ms
                </p>
                <p className="text-xs text-muted-foreground">
                  Cost: {optimizationResult.cost_slayer.cost_after}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={!ddlStatement}
              onClick={() => onApply(ddlStatement)}
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> Apply Fix
            </Button>
          </div>
        )}
        {status === "error" && (
          <p className="text-destructive font-semibold">
            Could not retrieve an optimization for this query.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
