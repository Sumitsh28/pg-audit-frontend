// app/dashboard/types.ts

export interface Problem {
  query: string;
  execution_time_ms?: number;
  query_plan_before?: any;
  calls?: number;
  error?: string;
}

export interface OptimizationResult {
  ai_suggestion: {
    rewritten_query: string | null;
    new_index_suggestion: string | null;
    explanation: string;
  };
  cost_slayer: {
    cost_before: number;
    cost_after: number;
  };
  estimated_execution_time_after_ms?: number;
}

export interface ProblemItem extends Problem {
  status: "idle" | "optimizing" | "optimized" | "error";
  optimizationResult?: OptimizationResult;
}
