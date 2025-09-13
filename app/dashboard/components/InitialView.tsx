"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Wand2, Upload } from "lucide-react";

interface InitialViewProps {
  isLoading: boolean;
  onBenchmark: () => void;
  onFileUpload: () => void;
}

export default function InitialView({
  isLoading,
  onBenchmark,
  onFileUpload,
}: InitialViewProps) {
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
