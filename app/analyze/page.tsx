"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { performAnalysis } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";
import Dashboard from "@/components/Dashboard";
import { QuerySourceSelector } from "@/components/QuerySourceSelector";

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const uri = searchParams.get("uri");

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const runAnalysis = (
    analysisMode: "initial" | "health_check" | "user_queries",
    queryFileContent?: string
  ) => {
    if (!uri) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError("");

    const decodedUri = decodeURIComponent(uri);
    performAnalysis({ dbUri: decodedUri, analysisMode, queryFileContent })
      .then((response) => {
        setAnalysisResult(response.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "An unexpected error occurred.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    runAnalysis("initial");
  }, [uri]);

  if (isLoading) return <LoadingScreen />;
  if (error)
    return <div className="text-red-500 text-center mt-20">{error}</div>;

  if (analysisResult?.status === "needs_input") {
    return (
      <QuerySourceSelector
        onHealthCheck={() => runAnalysis("health_check")}
        onFileSubmit={(content) => runAnalysis("user_queries", content)}
      />
    );
  }

  if (analysisResult?.status === "success") {
    return <Dashboard data={analysisResult} dbUri={decodeURIComponent(uri!)} />;
  }

  return (
    <div className="text-center mt-20">
      Something went wrong. Please try again.
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnalyzePageContent />
    </Suspense>
  );
}
