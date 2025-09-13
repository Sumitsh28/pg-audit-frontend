"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DbUriForm from "@/components/DbUriForm";

export default function HomePage() {
  const router = useRouter();
  const [dbUri, setDbUri] = useState("");
  const [writeDbUri, setWriteDbUri] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const handleConnect = () => {
    setConnectionError("");
    if (!dbUri) {
      setConnectionError("The Read-Only URI cannot be empty.");
      return;
    }

    setIsConnecting(true);

    sessionStorage.setItem("dbUri", JSON.stringify(dbUri));
    sessionStorage.setItem("writeDbUri", JSON.stringify(writeDbUri));

    router.push("/dashboard");
  };

  return (
    <main className="flex flex-col items-center justify-center p-4">
      <DbUriForm
        readUri={dbUri}
        setReadUri={setDbUri}
        writeUri={writeDbUri}
        setWriteUri={setWriteDbUri}
        onConnect={handleConnect}
        isConnecting={isConnecting}
        error={connectionError}
      />
    </main>
  );
}
