"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <-- IMPORT NEW COMPONENTS
import { Loader2 } from "lucide-react";

// UPDATE PROPS INTERFACE
interface DbUriFormProps {
  dbType: "postgresql" | "mysql";
  setDbType: (type: "postgresql" | "mysql") => void;
  readUri: string;
  setReadUri: (uri: string) => void;
  writeUri: string;
  setWriteUri: (uri: string) => void;
  onConnect: () => void;
  isConnecting: boolean;
  error: string;
}

export default function DbUriForm({
  dbType,
  setDbType,
  readUri,
  setReadUri,
  writeUri,
  setWriteUri,
  onConnect,
  isConnecting,
  error,
}: DbUriFormProps) {
  // ADD DYNAMIC PLACEHOLDER
  const placeholder =
    dbType === "postgresql"
      ? "postgresql://user:password@host:port/dbname"
      : "mysql+mysqlconnector://user:password@host:port/dbname";

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Connect to Your Database</CardTitle>
        <CardDescription>
          Provide your database connection URIs to begin the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* ADD DATABASE TYPE SELECTOR */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="db-type">Database Type</Label>
            <Select
              value={dbType}
              onValueChange={(value: "postgresql" | "mysql") =>
                setDbType(value)
              }
            >
              <SelectTrigger id="db-type">
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="read-uri">Read-Only URI</Label>
            <Input
              id="read-uri"
              placeholder={placeholder} // <-- USE DYNAMIC PLACEHOLDER
              value={readUri}
              onChange={(e) => setReadUri(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConnect();
              }}
            />
            <p className="text-sm text-muted-foreground">
              Used for safe analysis (`EXPLAIN`, schema reads, etc.).
            </p>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="write-uri">Write URI (Optional)</Label>
            <Input
              id="write-uri"
              placeholder={placeholder} // <-- USE DYNAMIC PLACEHOLDER
              value={writeUri}
              onChange={(e) => setWriteUri(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConnect();
              }}
            />
            <p className="text-sm text-muted-foreground">
              Used only when you explicitly click the 'Apply Fix' button.
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onConnect}
          disabled={isConnecting || !readUri}
          className="w-full"
        >
          {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Connect & Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
