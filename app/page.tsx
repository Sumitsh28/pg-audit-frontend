"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const [dbUri, setDbUri] = useState("");
  const router = useRouter();

  const handleStart = () => {
    // 1. Save the URI so the dashboard page can access it.
    sessionStorage.setItem("dbUri", JSON.stringify(dbUri));

    // 2. Clear any old analysis results to ensure a fresh start.
    sessionStorage.removeItem("analysisResult");

    // 3. Redirect to the dashboard to begin the new workflow.
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">PostgreSQL AI Optimizer</CardTitle>
          <CardDescription>
            Enter your database URI to begin a new analysis session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="db-uri" className="text-sm font-medium">
              PostgreSQL Database URI
            </label>
            <Input
              id="db-uri"
              placeholder="postgresql://user:password@host:port/dbname"
              value={dbUri}
              onChange={(e) => setDbUri(e.target.value)}
              aria-describedby="uri-help"
            />
            <p id="uri-help" className="text-xs text-muted-foreground">
              <span className="font-semibold text-amber-500">Important:</span>{" "}
              For your safety, we strongly recommend using a read-only user.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} disabled={!dbUri} className="w-full">
            Start Analysis Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
