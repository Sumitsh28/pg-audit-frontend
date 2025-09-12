"use client";

import { useRef } from "react";
import { Bot, Upload } from "lucide-react";

interface QuerySourceSelectorProps {
  onHealthCheck: () => void;
  onFileSubmit: (fileContent: string) => void;
}

export function QuerySourceSelector({
  onHealthCheck,
  onFileSubmit,
}: QuerySourceSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSubmit(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="text-center w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-2">No Query History Detected</h2>
        <p className="text-gray-400 mb-8">
          We couldn't find data in `pg_stat_statements`. Choose your path to
          proceed with the analysis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={onHealthCheck}
            className="bg-green-700/20 border border-green-600 text-white p-6 rounded-lg hover:bg-green-600/30 transition-colors text-left"
          >
            <Bot className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-xl font-semibold">
              Run Automated Health Check
            </h3>
            <p className="text-gray-400 mt-1">
              Our AI will generate and run safe, generic benchmark queries
              against your schema to find potential issues.
            </p>
          </button>

          <button
            onClick={handleUploadClick}
            className="bg-gray-700/20 border border-gray-600 text-white p-6 rounded-lg hover:bg-gray-600/30 transition-colors text-left"
          >
            <Upload className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold">Test My App's Queries</h3>
            <p className="text-gray-400 mt-1">
              Upload a `.sql` file containing the queries your application runs.
              Separate queries with a semicolon (;).
            </p>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".sql, .txt"
          />
        </div>
      </div>
    </div>
  );
}
