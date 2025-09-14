// app/dashboard/types.ts

export interface Problem {
  query: string;
  execution_time_ms?: number;
  query_plan_before?: any;
  calls?: number;
  error?: string;
}

export interface ProviderCostSavings {
  provider_name: string;
  potential_savings_inr_per_call: number;
}

export interface CostSlayerInfo {
  potential_savings: ProviderCostSavings[];
}

export interface OptimizationResult {
  ai_suggestion: {
    rewritten_query: string | null;
    new_index_suggestion: string | null;
    explanation: string;
    // ADDED: New data scan estimates from the AI
    estimated_data_scanned_before_mb?: number | null;
    estimated_data_scanned_after_mb?: number | null;
  };
  // UPDATED: Use the new CostSlayerInfo type
  cost_slayer: CostSlayerInfo;
  estimated_execution_time_after_ms?: number;
}

export interface ProblemItem extends Problem {
  status: "idle" | "optimizing" | "optimized" | "error";
  optimizationResult?: OptimizationResult;
}
