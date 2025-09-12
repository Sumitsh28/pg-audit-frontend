"use client";

import { Card, CardContent } from "@/components/ui/card";

type Risk = {
  id: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  message: string;
};

const risks: Risk[] = [
  {
    id: 1,
    level: "HIGH",
    message:
      "PII Leak: The query 'SELECT * FROM customers' exposes 4 sensitive columns (email, phone, address).",
  },
  {
    id: 2,
    level: "MEDIUM",
    message:
      "Potential SQL Injection vulnerability detected in uploaded query file 'search_queries.txt'.",
  },
  {
    id: 3,
    level: "LOW",
    message:
      "Use of SELECT * in 'orders' table may reveal unnecessary columns.",
  },
];

export default function SecurityTab() {
  const getColor = (level: Risk["level"]) => {
    switch (level) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-700 border-green-300";
    }
  };

  return (
    <div className="space-y-4">
      {risks.map((risk) => (
        <Card key={risk.id} className={`border-l-4 ${getColor(risk.level)}`}>
          <CardContent className="p-4">
            <p className="text-sm font-bold">{risk.level} RISK</p>
            <p className="text-sm">{risk.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
