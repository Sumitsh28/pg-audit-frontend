"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AnalysisOptions from "./components/AnalysisOptions";
import InitialView from "./components/InitialView";
import ProblemCard from "./components/ProblemCard";
import ResultsHeader from "./components/ResultsHeader";
import Chatbot from "./components/Chatbot";
import type { ProblemItem, OptimizationResult } from "./types";
import PerformanceSummaryGraph from "./components/PerformanceSummaryGraph";
import SandboxModal from "./components/SandboxModal";

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeChatProblemIndex, setActiveChatProblemIndex] = useState<
    number | null
  >(null);

  const [activeSandboxProblemIndex, setActiveSandboxProblemIndex] = useState<
    number | null
  >(null);

  const activeProblemForSandbox =
    activeSandboxProblemIndex !== null
      ? problems[activeSandboxProblemIndex]
      : null;

  const activeProblemForChat =
    activeChatProblemIndex !== null ? problems[activeChatProblemIndex] : null;

  const hasOptimizedProblems = problems.some((p) => p.status === "optimized");

  useEffect(() => {
    try {
      const savedUri = sessionStorage.getItem("dbUri");
      if (!savedUri || JSON.parse(savedUri) === "") {
        router.replace("/");
      } else {
        setIsReady(true);
      }
    } catch (e) {
      router.replace("/");
    }
  }, [router]);

  const startAnalysis = async (
    mode: "auto" | "benchmark" | "file",
    fileContent: string | null = null
  ) => {
    setIsLoading(true);
    setError(null);
    setProblems([]);
    setAnalysisSource(null);
    try {
      const currentDbUri = JSON.parse(sessionStorage.getItem("dbUri") || '""');
      const response = await axios.post(
        "http://localhost:8000/start-analysis-session",
        { db_uri: currentDbUri, mode: mode, file_content: fileContent }
      );
      setAnalysisSource(response.data.source);
      setProblems(
        response.data.problems.map((p: any) => ({ ...p, status: "idle" }))
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
    if (item.status !== "idle") return;
    items[problemIndex].status = "optimizing";
    setProblems(items);
    try {
      const currentDbUri = JSON.parse(sessionStorage.getItem("dbUri") || '""');
      const response = await axios.post<OptimizationResult>(
        "http://localhost:8000/get-optimization-suggestion",
        {
          db_uri: currentDbUri,
          query: item.query,
          execution_time_ms: item.execution_time_ms,
          query_plan_before: item.query_plan_before,
          // ADD THIS LINE:
          calls: item.calls,
        }
      );
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

  const handleApply = async (ddl: string) => {
    if (
      !confirm(
        "This will execute a DDL statement on your database. Are you sure?"
      )
    )
      return;
    try {
      const currentWriteUri = JSON.parse(
        sessionStorage.getItem("writeDbUri") || '""'
      );
      if (!currentWriteUri) {
        alert("Write URI not provided. Cannot apply fix.");
        return;
      }
      const resp = await axios.post("http://localhost:8000/apply", {
        write_db_uri: currentWriteUri,
        ddl_statement: ddl,
      });
      alert("Success: " + resp.data.message);
    } catch (err: any) {
      alert("Apply failed: " + (err.response?.data?.detail || err.message));
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

  if (!isReady) {
    return null;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          Analyzing database...
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error During Analysis</AlertTitle>
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

    if (analysisSource && problems.length > 0) {
      return (
        <div className="w-full max-w-5xl space-y-6">
          <div className="flex justify-between items-center">
            {/* The ResultsHeader component */}
            <ResultsHeader source={analysisSource} count={problems.length} />

            {hasOptimizedProblems && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Performance Summary
                  </Button>
                </DialogTrigger>

                <DialogContent className="h-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Optimization Performance Summary</DialogTitle>
                  </DialogHeader>
                  <PerformanceSummaryGraph problems={problems} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          {problems.map((item, index) => (
            <ProblemCard
              key={index}
              item={item}
              onOptimize={() => handleOptimize(index)}
              onApply={handleApply}
              onAskAI={() => setActiveChatProblemIndex(index)}
              onSandbox={() => setActiveSandboxProblemIndex(index)}
            />
          ))}
        </div>
      );
    }

    return (
      <>
        <AnalysisOptions
          isLoading={isLoading}
          onAutoAnalyze={() => startAnalysis("auto")}
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
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {renderContent()}
      {activeProblemForChat && (
        <Chatbot
          problem={activeProblemForChat}
          onClose={() => setActiveChatProblemIndex(null)}
        />
      )}

      {activeProblemForSandbox && (
        <SandboxModal
          isOpen={true}
          onClose={() => setActiveSandboxProblemIndex(null)}
          originalQuery={activeProblemForSandbox.query}
          optimizedQuery={
            activeProblemForSandbox.optimizationResult?.ai_suggestion
              .rewritten_query || null
          }
        />
      )}
    </main>
  );
}
