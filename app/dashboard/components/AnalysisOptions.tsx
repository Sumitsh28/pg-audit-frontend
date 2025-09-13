"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { History, Wand2, Upload } from "lucide-react";

interface AnalysisOptionsProps {
  isLoading: boolean;
  onPgStats: () => void;
  onBenchmark: () => void;
  onFileUpload: () => void;
}

export default function AnalysisOptions({
  isLoading,
  onPgStats,
  onBenchmark,
  onFileUpload,
}: AnalysisOptionsProps) {
  return (
    <Card className="w-full max-w-2xl text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Start New Analysis</CardTitle>
        <CardDescription>
          Choose a method to find queries for optimization.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <Button
          onClick={onPgStats}
          disabled={isLoading}
          variant="secondary"
          className="h-24 flex-col gap-2"
        >
          <History className="h-6 w-6" />
          <span>From Query History</span>
          <span className="text-xs text-muted-foreground">
            (pg_stat_statements)
          </span>
        </Button>
        <Button
          onClick={onBenchmark}
          disabled={isLoading}
          variant="secondary"
          className="h-24 flex-col gap-2"
        >
          <Wand2 className="h-6 w-6" />
          <span>Automated Health Check</span>
          <span className="text-xs text-muted-foreground">(AI Generated)</span>
        </Button>
        <Button
          onClick={onFileUpload}
          disabled={isLoading}
          variant="secondary"
          className="h-24 flex-col gap-2"
        >
          <Upload className="h-6 w-6" />
          <span>Load Queries from File</span>
          <span className="text-xs text-muted-foreground">(*.sql)</span>
        </Button>
      </CardContent>
    </Card>
  );
}
