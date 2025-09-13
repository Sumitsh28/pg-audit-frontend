"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { CodeBlock } from "react-code-block";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck,
  Sparkles,
  Wand2,
  Upload,
  FileText,
  History,
  Loader2,
} from "lucide-react";

// --- TYPE DEFINITIONS ---
interface Problem {
  query: string;
  execution_time_ms?: number;
  query_plan_before?: any;
  calls?: number;
  error?: string;
}

interface OptimizationResult {
  ai_suggestion: {
    rewritten_query: string | null;
    new_index_suggestion: string | null;
    explanation: string;
  };
  cost_slayer: { cost_before: number; cost_after: number };
  estimated_execution_time_after_ms?: number;
}

interface ProblemItem extends Problem {
  status: "idle" | "optimizing" | "optimized" | "error";
  optimizationResult?: OptimizationResult;
}

const handleApply = async (ddl: string, problemIndex: number) => {
  if (!confirm("This will execute the DDL on your WRITE DB. Proceed?")) return;
  try {
    const writeDbUri = JSON.parse(sessionStorage.getItem("writeDbUri") || '""');
    const resp = await axios.post("http://localhost:8000/apply", {
      write_db_uri: writeDbUri,
      ddl_statement: ddl,
    });
    alert("Applied: " + resp.data.message);
    // Optionally refresh analysis or update UI to mark applied
  } catch (err: any) {
    alert("Apply failed: " + (err.response?.data?.detail || err.message));
  }
};

// --- MAIN DASHBOARD COMPONENT ---
export default function DashboardPage() {
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startAnalysis = async (
    mode: "auto" | "benchmark" | "file",
    fileContent: string | null = null
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const dbUri = JSON.parse(sessionStorage.getItem("dbUri") || '""');
      const response = await axios.post(
        "http://localhost:8000/start-analysis-session",
        {
          db_uri: dbUri,
          mode: mode,
          file_content: fileContent,
        }
      );
      setAnalysisSource(response.data.source);
      setProblems(
        response.data.problems.map((p: Problem) => ({ ...p, status: "idle" }))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async (problemIndex: number) => {
    const items = [...problems];
    const item = items[problemIndex];
    if (item.status !== "idle") return; // Prevent re-optimizing
    items[problemIndex].status = "optimizing";
    setProblems(items);

    try {
      const dbUri = JSON.parse(sessionStorage.getItem("dbUri") || '""');
      const response = await axios.post<OptimizationResult>(
        "http://localhost:8000/get-optimization-suggestion",
        {
          db_uri: dbUri,
          query: item.query,
          execution_time_ms: item.execution_time_ms,
          query_plan_before: item.query_plan_before,
        }
      );

      // Use a functional update to ensure we're updating the latest state
      setProblems((currentProblems) => {
        const updatedProblems = [...currentProblems];
        updatedProblems[problemIndex].status = "optimized";
        updatedProblems[problemIndex].optimizationResult = response.data;
        return updatedProblems;
      });
    } catch (err: any) {
      setProblems((currentProblems) => {
        const updatedProblems = [...currentProblems];
        updatedProblems[problemIndex].status = "error";
        return updatedProblems;
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => startAnalysis("file", e.target?.result as string);
    reader.readAsText(file);
    event.target.value = "";
  };

  useEffect(() => {
    startAnalysis("auto");
  }, []);

  if (isLoading && problems.length === 0) {
    return (
      <div className="text-center flex items-center gap-2">
        <Loader2 className="animate-spin h-5 w-5" />
        Analyzing database...
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (analysisSource === "empty") {
    return (
      <>
        <InitialView
          isLoading={isLoading}
          onBenchmark={() => startAnalysis("benchmark")}
          onFileUpload={() => fileInputRef.current?.click()}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.sql"
          className="hidden"
        />
      </>
    );
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
      <Header source={analysisSource} count={problems.length} />
      {isLoading && (
        <div className="text-center flex items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          Loading new analysis...
        </div>
      )}
      {problems.map((item, index) => (
        <ProblemCard
          key={index}
          item={item}
          onOptimize={() => handleOptimize(index)}
        />
      ))}
    </div>
  );
}

// --- UI SUB-COMPONENTS ---

function Header({ source, count }: { source: string | null; count: number }) {
  // ... (This component is unchanged)
  const titles = {
    pg_stat_statements: {
      icon: <History className="mr-2 h-6 w-6" />,
      text: "Analysis from Query History",
    },
    automated_benchmark: {
      icon: <Wand2 className="mr-2 h-6 w-6" />,
      text: "Automated Benchmark Results",
    },
    user_file: {
      icon: <FileText className="mr-2 h-6 w-6" />,
      text: "Analysis from Uploaded File",
    },
  };
  const current = titles[source as keyof typeof titles] || {
    icon: null,
    text: "Analysis Results",
  };

  return (
    <div>
      <div className="flex items-center text-3xl font-bold tracking-tight">
        {current.icon} {current.text}
      </div>
      <p className="text-muted-foreground">
        {count} potential issue(s) found. You can now optimize them
        individually.
      </p>
    </div>
  );
}

// --- MODIFIED InitialView to accept isLoading prop ---
function InitialView({ isLoading, onBenchmark, onFileUpload }: any) {
  return (
    <Card className="w-full max-w-2xl text-center">
      <CardHeader>
        <CardTitle className="text-2xl">No Query History Found</CardTitle>
        <CardDescription>
          We checked `pg_stat_statements` but didn't find any activity. Please
          choose an alternative analysis method.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <Button
          onClick={onBenchmark}
          disabled={isLoading}
          variant="secondary"
          className="h-20 flex-col gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Wand2 className="h-6 w-6" />
          )}
          <span>Run Automated Health Check</span>
        </Button>
        <Button
          onClick={onFileUpload}
          disabled={isLoading}
          variant="secondary"
          className="h-20 flex-col gap-2"
        >
          <Upload className="h-6 w-6" />
          <span>Test My App's Queries</span>
        </Button>
      </CardContent>
    </Card>
  );
}

// --- MODIFIED ProblemCard for better loading state ---
function ProblemCard({
  item,
  onOptimize,
}: {
  item: ProblemItem;
  onOptimize: () => void;
}) {
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
          <div className="flex-shrink-0">
            {status === "idle" && (
              <Button onClick={onOptimize}>
                <Sparkles className="mr-2 h-4 w-4" /> Optimize
              </Button>
            )}
            {status === "optimizing" && (
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" /> Optimizing...
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {/* (The rest of ProblemCard is unchanged from the last version, showing the full report when optimized) */}
      <CardContent className="p-4 space-y-4">
        {error && (
          <p className="text-destructive font-semibold">
            Error during benchmark: {error}
          </p>
        )}
        <div className="flex gap-4 text-sm">
          {execution_time_ms && (
            <p>
              Execution time:{" "}
              <strong className="text-amber-500">
                {execution_time_ms.toFixed(2)} ms
              </strong>
            </p>
          )}
          {calls && (
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
                <div className="rounded-md bg-slate-950">
                  {/* <CodeBlock
                    code={
                      optimizationResult.ai_suggestion.rewritten_query ?? ""
                    }
                    language="sql"
                    theme="dracula"
                  /> */}
                  {optimizationResult.ai_suggestion.rewritten_query}
                </div>

                {/* Warning badge if server flagged it as unsafe in explanation */}
                {optimizationResult?.ai_suggestion?.explanation
                  ?.toLowerCase()
                  .includes("rejected") && (
                  <div className="mt-2 p-2 bg-yellow-900 text-yellow-300 rounded text-sm">
                    ⚠️ Index suggestion was flagged as <strong>unsafe</strong>{" "}
                    by the validator. You can still apply it manually after
                    confirming.
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="default">
                <Wand2 className="h-4 w-4" />
                <AlertTitle>No Code Change Recommended</AlertTitle>
                <AlertDescription>
                  The AI concluded that the current query structure is already
                  optimal.
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
              onClick={() => handleApply(ddlStatement, index)} // pass row index for feedback
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
