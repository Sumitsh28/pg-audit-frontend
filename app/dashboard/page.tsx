// app/dashboard/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

import AnalysisOptions from "./components/AnalysisOptions";
import InitialView from "./components/InitialView";
import ProblemCard from "./components/ProblemCard";
import ResultsHeader from "./components/ResultsHeader";
import type { ProblemItem, OptimizationResult } from "./types";

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false); // Controls rendering until session is verified

  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // On page load, verify that a DB URI exists in session storage.
  // If not, redirect back to the home page to connect.
  useEffect(() => {
    try {
      const savedUri = sessionStorage.getItem("dbUri");
      if (!savedUri || JSON.parse(savedUri) === "") {
        router.replace("/"); // Redirect if no URI
      } else {
        setIsReady(true); // URI exists, allow component to render
      }
    } catch (e) {
      router.replace("/"); // Redirect on any error
    }
  }, [router]);

  const startAnalysis = async (
    mode: "auto" | "benchmark" | "file",
    fileContent: string | null = null
  ) => {
    // ... this function is unchanged from before
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
    // ... this function is unchanged from before
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
    // ... this function is unchanged from before
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
    // ... this function is unchanged from before
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => startAnalysis("file", e.target?.result as string);
    reader.readAsText(file);
    event.target.value = "";
  };

  // --- RENDER LOGIC ---

  // Don't render anything until the session check is complete
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
    if (!analysisSource) {
      return (
        <>
          <AnalysisOptions
            isLoading={isLoading}
            onPgStats={() => startAnalysis("auto")}
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
        <ResultsHeader source={analysisSource} count={problems.length} />
        {problems.map((item, index) => (
          <ProblemCard
            key={index}
            item={item}
            onOptimize={() => handleOptimize(index)}
            onApply={handleApply}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {renderContent()}
    </main>
  );
}
