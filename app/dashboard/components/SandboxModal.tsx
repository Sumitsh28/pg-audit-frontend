"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FlaskConical,
} from "lucide-react";
import type { SandboxResult } from "../types";

// --- PROPS INTERFACE ---
interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalQuery: string;
  optimizedQuery: string | null;
}

// --- HELPER COMPONENT FOR DISPLAYING RESULTS ---
const QueryResultTable = ({
  title,
  results,
}: {
  title: string;
  results: Record<string, any>[];
}) => {
  if (results.length === 0) {
    return (
      <div>
        <h4 className="font-semibold mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground">No results returned.</p>
      </div>
    );
  }

  const headers = Object.keys(results[0]);

  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="border rounded-md max-h-60 overflow-auto">
        <Table>
          <TableHeader className="bg-secondary sticky top-0">
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`}>
                    {String(row[header])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// --- MAIN MODAL COMPONENT ---
export default function SandboxModal({
  isOpen,
  onClose,
  originalQuery,
  optimizedQuery,
}: SandboxModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SandboxResult | null>(null);

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const currentDbUri = JSON.parse(sessionStorage.getItem("dbUri") || '""');
      const response = await axios.post<SandboxResult>(
        "http://localhost:8000/verify-queries",
        {
          db_uri: currentDbUri,
          original_query: originalQuery,
          optimized_query: optimizedQuery,
        }
      );

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResult(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-auto h-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" /> Query Sandbox
          </DialogTitle>
          <DialogDescription>
            Run the original and optimized queries with a LIMIT 20 clause to
            verify their outputs match.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert
              variant={result.match ? "default" : "destructive"}
              className={result.match ? "bg-green-950 border-green-800" : ""}
            >
              {result.match ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle className={result.match ? "text-green-400" : ""}>
                {result.match
                  ? "Correct: Outputs Match"
                  : "Mismatch: Outputs Do Not Match"}
              </AlertTitle>
              <AlertDescription>
                The top 20 results for both queries were compared.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-10">
            {result ? (
              <>
                <QueryResultTable
                  title="Original Query Results"
                  results={result.original_query_results}
                />
                <hr className="border-t border-[#1f1f1f] border-3" />
                <QueryResultTable
                  title="Optimized Query Results"
                  results={result.optimized_query_results}
                />
              </>
            ) : (
              <div className="md:col-span-2 text-center text-muted-foreground p-8 bg-secondary rounded-md">
                Click "Run & Compare" to see the query results.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={isLoading}
            className="w-40"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Run & Compare"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
