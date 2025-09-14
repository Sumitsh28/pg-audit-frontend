"use client";

import { FileText, History, Wand2 } from "lucide-react";

interface ResultsHeaderProps {
  source: string | null;
  count: number;
}

export default function ResultsHeader({ source, count }: ResultsHeaderProps) {
  const titles = {
    // THIS ENTRY IS FOR POSTGRESQL
    pg_stat_statements: {
      icon: <History className="mr-2 h-6 w-6" />,
      text: "Analysis from Query History",
    },
    // ADD THIS NEW ENTRY FOR MYSQL
    "Performance Schema": {
      icon: <History className="mr-2 h-6 w-6" />,
      text: "Analysis from MySQL Performance Schema",
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
    icon: <History className="mr-2 h-6 w-6" />, // Add a default icon
    text: source ? `Analysis from ${source}` : "Analysis Results",
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
