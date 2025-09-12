"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo } from "react";

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    original_plan: string;
    new_plan: string;
  };
}

const extractCost = (plan: string): number => {
  const match = plan.match(/cost=\d+\.\d+\.\.([\d\.]+)/);
  return match ? parseFloat(match[1]) : 0;
};

export function SimulateModal({ isOpen, onClose, data }: SimulateModalProps) {
  const improvement = useMemo(() => {
    const originalCost = extractCost(data.original_plan);
    const newCost = extractCost(data.new_plan);
    if (originalCost > 0 && newCost > 0) {
      const factor = originalCost / newCost;
      return `${factor.toFixed(1)}x faster`;
    }
    return "Significant improvement";
  }, [data]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white rounded-lg shadow-2xl w-[90vw] max-w-6xl max-h-[90vh] z-50 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <Dialog.Title className="text-xl font-bold">
              Simulation Results
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full hover:bg-gray-700">
                <X size={20} />
              </button>
            </Dialog.Close>
          </header>

          <div className="p-6 bg-green-900/20 text-center border-b border-gray-700 flex-shrink-0">
            <h3 className="text-2xl font-bold text-green-400">
              Predicted Result: {improvement}
            </h3>
            <p className="text-gray-300">
              Applying this fix is predicted to make the query significantly
              more efficient.
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
            {/* Before Plan */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-red-400">
                Before (Original Plan)
              </h4>
              <pre className="bg-gray-900 p-4 rounded-md text-xs text-gray-300 overflow-auto h-96 border border-red-900/50">
                <code>{data.original_plan}</code>
              </pre>
            </div>

            {/* After Plan */}
            <div>
              <h4 className="text-lg font-semibold mb-2 text-green-400">
                After (Optimized Plan)
              </h4>
              <pre className="bg-gray-900 p-4 rounded-md text-xs text-gray-300 overflow-auto h-96 border border-green-900/50">
                <code>{data.new_plan}</code>
              </pre>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
