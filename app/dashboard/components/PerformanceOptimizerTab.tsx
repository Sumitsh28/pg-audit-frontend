import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import IssueCard from "./IssueCard";
import { Clock } from "lucide-react";

// This interface is now updated to match the backend's Pydantic model exactly.
interface PerformanceIssue {
  id: number;
  query: string;
  avg_execution_time_ms: number | null;
  actual_execution_time_ms: number | null;
  estimated_execution_time_after_ms: number | null;
  calls: number;
  cost_slayer: {
    estimated_daily_cost: number;
    potential_savings_percentage: number;
    cost_before: number;
    cost_after: number;
  };
  ai_suggestion: {
    rewritten_query: string | null;
    new_index_suggestion: string | null;
    explanation: string;
  };
  query_plan_before: any;
}

interface PerformanceOptimizerTabProps {
  issues: PerformanceIssue[];
}

export default function PerformanceOptimizerTab({
  issues,
}: PerformanceOptimizerTabProps) {
  if (!issues || issues.length === 0) {
    return (
      <p className="mt-6 text-center text-muted-foreground">
        No performance issues detected.
      </p>
    );
  }

  const defaultOpenValue = `item-${issues[0].id}`;

  return (
    <div className="mt-6">
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpenValue}
        className="w-full space-y-4"
      >
        {issues.map((issue) => {
          // Prioritize the actual measured time, but fall back to the average from pg_stats
          const executionTime =
            issue.actual_execution_time_ms ?? issue.avg_execution_time_ms;
          return (
            <AccordionItem
              key={issue.id}
              value={`item-${issue.id}`}
              className="border rounded-lg bg-card"
            >
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left gap-4">
                  <p className="font-mono text-sm truncate max-w-lg pr-4 text-foreground">
                    {issue.query}
                  </p>
                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    {executionTime && (
                      <span className="flex items-center font-semibold text-amber-500">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {executionTime.toFixed(2)} ms
                      </span>
                    )}
                    <span className="text-destructive font-semibold">
                      ${issue.cost_slayer.estimated_daily_cost.toFixed(2)}/day
                    </span>
                    <span className="text-green-500 font-semibold">
                      {issue.cost_slayer.potential_savings_percentage}% Savings
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                <IssueCard issue={issue} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
