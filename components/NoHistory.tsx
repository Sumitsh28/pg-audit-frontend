"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NoHistory() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-[400px] shadow-lg border border-gray-200">
        <CardContent className="p-6 space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="text-lg font-semibold">No Query History Detected</h2>
          <p className="text-sm text-gray-600">
            We couldn’t find any query logs. Connect your database or run some
            queries to get started.
          </p>
          <Button className="w-full">Connect Database</Button>
        </CardContent>
      </Card>
    </div>
  );
}
