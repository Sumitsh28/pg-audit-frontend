"use client";

import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";

const loadingTexts = [
  "Connecting to database...",
  "Inspecting schema and indexes...",
  "Auditing for security risks...",
  "Analyzing query history from pg_stat_statements...",
  "Identifying performance bottlenecks...",
  "Running cost analysis models...",
  "Consulting with AI expert...",
  "Compiling optimization report...",
];

export default function LoadingScreen() {
  const [currentText, setCurrentText] = useState(loadingTexts[0]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setCurrentText(loadingTexts[index]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="flex flex-col items-center gap-6">
        <LoaderCircle className="h-16 w-16 animate-spin text-blue-500" />
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI Analysis in Progress</h1>
          <p className="text-gray-400 mt-2 text-lg transition-opacity duration-500">
            {currentText}
          </p>
        </div>
      </div>
    </main>
  );
}
