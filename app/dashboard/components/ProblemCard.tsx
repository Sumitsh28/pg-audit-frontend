"use client";

// MODIFICATION: Import primitives, cn utility, and ChevronDown
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  // AccordionTrigger is no longer used
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Sparkles,
  Wand2,
  ShieldCheck,
  MessageSquarePlus,
  IndianRupee,
  ChevronDown,
  FlaskConical,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { ProblemItem } from "../types";
import { useState } from "react";
import Image from "next/image";

interface ProblemCardProps {
  item: ProblemItem;
  onOptimize: () => void;
  onApply: (ddl: string) => void;
  onAskAI: () => void;
  onSandbox: () => void;
}

export default function ProblemCard({
  item,
  onOptimize,
  onApply,
  onAskAI,
  onSandbox,
}: ProblemCardProps) {
  const { query, execution_time_ms, calls, error, status, optimizationResult } =
    item;

  const [callCount, setCallCount] = useState(100);

  const ddlStatement =
    optimizationResult?.ai_suggestion.new_index_suggestion ||
    optimizationResult?.ai_suggestion.rewritten_query ||
    "";

  const hasSavings =
    optimizationResult?.cost_slayer?.potential_savings &&
    optimizationResult.cost_slayer.potential_savings.length > 0;

  const providerLogos: { [key: string]: string } = {
    "aws athena": "/athena.svg",
    "google bigquery": "/big.svg",
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-border">
        <AccordionPrimitive.Header className="flex">
          <AccordionPrimitive.Trigger asChild>
            <div
              className={cn(
                "flex w-full cursor-pointer items-start justify-between gap-4 p-4 text-left font-medium transition-all hover:no-underline rounded-3xl rounded-b-none",
                "bg-[#1f1f1f]",
                "[&[data-state=open]>svg]:rotate-180"
              )}
            >
              <div className="flex flex-grow items-start gap-4 min-w-0">
                <div className="font-mono text-sm text-secondary-foreground flex-grow text-left min-w-0">
                  <pre className="whitespace-pre-wrap break-words font-sans">
                    <code>{query}</code>
                  </pre>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {status === "idle" && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOptimize();
                      }}
                      size="sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" /> Optimize
                    </Button>
                  )}
                  {status === "optimizing" && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Optimizing...
                    </div>
                  )}
                  {status !== "optimizing" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAI();
                      }}
                    >
                      <MessageSquarePlus className="mr-2 h-4 w-4" /> Ask AI
                    </Button>
                  )}
                </div>
              </div>

              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </div>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionContent>
          <div className="p-4 pt-0 space-y-4 bg-[#1f1f1f] rounded-3xl rounded-t-none">
            {error && (
              <p className="text-destructive font-semibold">
                Error during benchmark: {error}
              </p>
            )}
            <div className="flex gap-4 text-sm">
              {execution_time_ms != null && (
                <p>
                  Execution time:{" "}
                  <strong className="text-amber-500">
                    {execution_time_ms?.toFixed(2)} ms
                  </strong>
                </p>
              )}
              {calls != null && (
                <p>
                  Calls: <strong className="text-blue-400">{calls}</strong>
                </p>
              )}
            </div>

            {status === "optimized" && optimizationResult && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex flex-row justify-between items-center">
                  <h3 className="font-semibold text-lg">AI Suggestion</h3>
                  <Button variant="outline" size="sm" onClick={onSandbox}>
                    <FlaskConical className="mr-2 h-4 w-4" /> Run on Sandbox
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {optimizationResult.ai_suggestion.explanation}
                </p>

                {ddlStatement ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Suggested Code:
                    </h4>
                    <div className="p-2 rounded-md bg-slate-950 font-mono text-xs">
                      <pre className="whitespace-pre-wrap break-words font-sans">
                        <code>
                          {optimizationResult.ai_suggestion.rewritten_query ||
                            optimizationResult.ai_suggestion
                              .new_index_suggestion}
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <Alert variant="default">
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle>No Code Change Recommended</AlertTitle>
                    <AlertDescription>
                      The AI concluded that the current query is already
                      optimal.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2 bg-secondary rounded">
                    <h4 className="text-xs font-semibold uppercase">
                      Execution Time (Before)
                    </h4>
                    <p className="font-bold text-lg">
                      {execution_time_ms?.toFixed(2)} ms
                    </p>
                  </div>
                  <div className="p-2 bg-green-950 rounded border border-green-800">
                    <h4 className="text-xs font-semibold uppercase text-green-400">
                      Execution Time (After, Est.)
                    </h4>
                    <p className="font-bold text-lg text-green-400">
                      ~
                      {optimizationResult.estimated_execution_time_after_ms?.toFixed(
                        2
                      )}{" "}
                      ms
                    </p>
                  </div>
                </div>

                {hasSavings && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <IndianRupee className="mr-2 h-4 w-4" />
                      Potential Daily Savings
                    </h4>
                    <div className="p-3 bg-secondary rounded mb-3">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-semibold text-muted-foreground">
                          Estimated Daily Calls
                        </span>
                        <span className="font-bold text-blue-400 text-base">
                          {callCount.toLocaleString()}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[100]}
                        min={100}
                        max={10000000}
                        step={100}
                        onValueChange={(value) => setCallCount(value[0])}
                      />
                    </div>

                    <div className="space-y-1">
                      {optimizationResult.cost_slayer.potential_savings.map(
                        (saving) => (
                          <div
                            key={saving.provider_name}
                            className="flex justify-between items-center text-sm p-2 bg-secondary/50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              {providerLogos[
                                saving.provider_name.toLowerCase()
                              ] && (
                                <Image
                                  src={
                                    providerLogos[
                                      saving.provider_name.toLowerCase()
                                    ]
                                  }
                                  alt={`${saving.provider_name} logo`}
                                  width={16}
                                  height={16}
                                />
                              )}
                              <span className="text-muted-foreground">
                                {saving.provider_name}
                              </span>
                            </div>

                            <span className="font-bold text-green-400">
                              ₹
                              {(
                                saving.potential_savings_inr_per_call *
                                callCount
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!ddlStatement}
                  onClick={() => onApply(ddlStatement)}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Apply Fix
                </Button>
              </div>
            )}
            {status === "error" && (
              <p className="text-destructive font-semibold">
                Could not retrieve an optimization for this query.
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
