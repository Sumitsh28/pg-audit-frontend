import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "react-code-block";

interface SimulationResult {
  query_plan_before: any;
  query_plan_after: any;
  estimated_improvement_factor: number;
}

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SimulationResult | null;
}

export default function SimulationModal({
  isOpen,
  onClose,
  data,
}: SimulationModalProps) {
  if (!isOpen || !data) {
    return null;
  }

  // Function to safely stringify JSON for display
  const formatPlan = (plan: any) => JSON.stringify(plan, null, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Simulation Result</DialogTitle>
          <DialogDescription>
            Comparing the query execution plans before and after the suggested
            fix.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center my-4 p-4 bg-green-900/50 border border-green-700 rounded-lg">
          <p className="text-2xl font-bold text-green-400">
            This fix is predicted to make the query{" "}
            {data.estimated_improvement_factor}x faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-hidden">
          {/* Before Plan */}
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="font-semibold mb-2 text-center">Before</h3>
            <div className="flex-grow overflow-y-auto bg-slate-900 rounded-md p-2 text-xs">
              <CodeBlock
                code={formatPlan(data.query_plan_before)}
                language="json"
                theme="dracula"
              />
            </div>
          </div>

          {/* After Plan */}
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="font-semibold mb-2 text-center">After</h3>
            <div className="flex-grow overflow-y-auto bg-slate-900 rounded-md p-2 text-xs">
              <CodeBlock
                code={formatPlan(data.query_plan_after)}
                language="json"
                theme="dracula"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
