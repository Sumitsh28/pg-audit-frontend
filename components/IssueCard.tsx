"use client";

import { useState } from "react";
import { simulateFix, applyFix } from "@/lib/api";
import { SimulateModal } from "./SimulateModal";
import { ChevronDown, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import clsx from "clsx";

interface IssueCardProps {
  issue: any;
  dbUri: string;
}

export function IssueCard({ issue, dbUri }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOptimized =
    issue.potential_savings_percent === 0 && issue.daily_cost_estimate < 0.5;

  const handleSimulate = async () => {
    if (!issue.ddl_fix) return;
    setIsSimulating(true);
    try {
      const res = await simulateFix(dbUri, issue.ddl_fix, issue.query);
      setSimulationData(res.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Simulation failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApply = async () => {
    if (!issue.ddl_fix) return;
    const writeUri = prompt(
      "DANGER ZONE\n\nTo apply this fix, you MUST provide a database URI with WRITE permissions.\n\nEnter your write-enabled database URI:"
    );
    if (!writeUri) {
      alert("Apply action cancelled.");
      return;
    }
    if (
      confirm(
        `FINAL CONFIRMATION\n\nYou are about to execute:\n\n${issue.ddl_fix}\n\nAre you absolutely sure?`
      )
    ) {
      try {
        await applyFix(writeUri, issue.ddl_fix);
        alert("Success! The fix has been applied.");
      } catch (error) {
        alert("Failed to apply fix. Check console for details.");
      }
    }
  };

  return (
    <div
      className={clsx(
        "border rounded-lg shadow-sm transition-all duration-300",
        {
          "bg-gray-800/50 border-gray-700 hover:border-gray-600": !isOptimized,
          "bg-green-900/20 border-green-800/50 hover:border-green-700":
            isOptimized,
        }
      )}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start gap-4">
          <pre className="font-mono text-sm text-gray-300 bg-gray-900/50 p-2 rounded-md flex-grow overflow-x-auto">
            <code>{issue.query}</code>
          </pre>
          <div className="text-right flex-shrink-0 w-48 flex flex-col justify-center items-end h-full">
            {isOptimized ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-green-400 bg-green-900/50 px-3 py-1 rounded-full text-sm font-medium">
                  <ShieldCheck size={16} />
                  <span>Optimized</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <Clock size={12} />
                  <span>{issue.total_exec_time_ms.toFixed(2)} ms</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-red-400 font-bold text-lg">
                  ${issue.daily_cost_estimate.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">Est. Daily Cost</p>
                <p className="text-green-400 text-sm mt-1">
                  Save {issue.potential_savings_percent}%
                </p>
              </div>
            )}
          </div>
          <ChevronDown
            className={clsx(
              "text-gray-500 transition-transform flex-shrink-0 mt-1",
              { "rotate-180": isExpanded }
            )}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700/50">
          <div className="mt-4">
            <h3 className="font-bold text-lg text-gray-200">AI Analysis</h3>
            <p className="text-gray-300 my-2 text-sm leading-relaxed">
              {issue.explanation}
            </p>

            {!isOptimized && issue.ddl_fix && (
              <div className="bg-gray-900/70 p-3 rounded-lg font-mono text-xs my-4">
                <h4 className="text-gray-400">Suggested Fix (DDL):</h4>
                <pre className="text-yellow-400 mt-1">
                  <code>{issue.ddl_fix}</code>
                </pre>
              </div>
            )}

            {!isOptimized && issue.ddl_fix && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {isSimulating ? "Simulating..." : "Simulate Fix"}
                </button>
                <button
                  onClick={handleApply}
                  className="bg-red-700 hover:bg-red-800 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  <AlertTriangle size={16} /> Apply Fix
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {simulationData && (
        <SimulateModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSimulationData(null);
          }}
          data={simulationData}
        />
      )}
    </div>
  );
}
