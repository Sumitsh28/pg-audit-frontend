"use client";

import { IssueCard } from "./IssueCard";
import { CheckCircle, Info } from "lucide-react";

export default function Dashboard({
  data,
  dbUri,
}: {
  data: any;
  dbUri: string;
}) {
  const hasOnlyPasses = data.issues.every(
    (issue: any) =>
      issue.potential_savings_percent === 0 && issue.daily_cost_estimate < 0.5
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Performance Analysis Report</h1>
          <p className="text-gray-400">
            {hasOnlyPasses
              ? "Health check complete. See below for a summary of the queries we ran."
              : "Prioritized list of performance issues detected in your database."}
          </p>
        </div>

        {data.issues.length > 0 ? (
          <>
            {hasOnlyPasses && (
              <div className="bg-green-900/50 border border-green-700 text-green-200 px-6 py-4 rounded-lg mb-8 flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-lg">All Clear!</h2>
                  <p className="text-sm">
                    The automated health check completed successfully. No
                    critical performance issues were found.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {data.issues.map((issue: any) => (
                <IssueCard
                  key={issue.query_hash || issue.query}
                  issue={issue}
                  dbUri={dbUri}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 text-gray-400 px-6 py-4 rounded-lg mt-8 flex items-center gap-4">
            <Info className="h-8 w-8 text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-lg text-white">
                Analysis Complete
              </h2>
              <p>
                No benchmark queries could be generated, or no issues were found
                in the provided queries. This can occur with empty databases or
                simple schemas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
