"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

type QuerySim = {
  id: number;
  query: string;
  status: "green" | "yellow" | "red";
  bottleneckAt?: string;
};

export default function TimeMachineTab() {
  const [growth, setGrowth] = useState(1);

  const queries: QuerySim[] = [
    {
      id: 1,
      query: "SELECT * FROM users WHERE email = ?;",
      status: growth < 10 ? "green" : growth < 50 ? "yellow" : "red",
      bottleneckAt: "10x",
    },
    {
      id: 2,
      query: "SELECT * FROM orders WHERE status = 'pending';",
      status: growth < 20 ? "green" : growth < 70 ? "yellow" : "red",
      bottleneckAt: "20x",
    },
    {
      id: 3,
      query: "SELECT COUNT(*) FROM logs;",
      status: growth < 5 ? "green" : growth < 15 ? "yellow" : "red",
      bottleneckAt: "5x",
    },
  ];

  const getColor = (status: QuerySim["status"]) => {
    if (status === "green") return "text-green-600";
    if (status === "yellow") return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="font-medium mb-2">Simulate Future Data Growth</p>
        <Slider
          value={[growth]}
          min={1}
          max={100}
          step={1}
          onValueChange={(val) => setGrowth(val[0])}
        />
        <p className="text-sm text-gray-500 mt-2">Growth factor: {growth}x</p>
      </div>

      <div className="space-y-4">
        {queries.map((q) => (
          <Card key={q.id} className="shadow border border-gray-200">
            <CardContent className="p-4">
              <p className="font-mono text-sm">{q.query}</p>
              <p className={`text-sm font-bold ${getColor(q.status)}`}>
                {q.status === "green" && "Healthy ✅"}
                {q.status === "yellow" &&
                  "At Risk ⚠️ (Bottleneck at " + q.bottleneckAt + ")"}
                {q.status === "red" && "Critical 🔥 (Already bottlenecked)"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
