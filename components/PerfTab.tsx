"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Issue = {
  id: number;
  query: string;
  problem: string;
  cost: string;
  savings: string;
  optimizedQuery: string;
};

const mockIssues: Issue[] = [
  {
    id: 1,
    query: "SELECT * FROM users;",
    problem: "Full table scan on users (1.5M rows).",
    cost: "Estimated Daily Cost: $85.40",
    savings: "Potential Savings: 98%",
    optimizedQuery: "SELECT id, name, email FROM users WHERE id = ?;",
  },
  {
    id: 2,
    query: "SELECT * FROM orders WHERE status = 'pending';",
    problem: "No index on 'status' column.",
    cost: "Estimated Daily Cost: $12.10",
    savings: "Potential Savings: 67%",
    optimizedQuery: "CREATE INDEX idx_orders_status ON orders(status);",
  },
];

export default function PerfTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {mockIssues.map((issue) => (
        <Card key={issue.id} className="shadow-md border border-gray-200">
          <CardContent className="p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setExpanded(expanded === issue.id ? null : issue.id)
              }
            >
              <div>
                <p className="font-mono text-sm text-gray-700">{issue.query}</p>
                <p className="text-red-600 text-sm">{issue.problem}</p>
                <p className="text-gray-500 text-xs">
                  {issue.cost} | {issue.savings}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {expanded === issue.id ? "Collapse" : "Expand"}
              </Button>
            </div>

            {expanded === issue.id && (
              <div className="mt-4 space-y-3 border-t pt-3">
                <p className="text-sm text-gray-600">
                  <b>Optimized Query:</b>
                </p>
                <pre className="bg-gray-100 rounded-md p-3 text-xs overflow-x-auto">
                  {issue.optimizedQuery}
                </pre>

                <div className="flex space-x-3">
                  <Button size="sm" className="bg-blue-600 text-white">
                    Simulate Fix
                  </Button>
                  <Button size="sm" variant="destructive">
                    Apply Fix
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
