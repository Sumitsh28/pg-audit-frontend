"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [uri, setUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLaunch = () => {
    if (!uri) {
      setError("Database URI cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError("");
    const encodedUri = encodeURIComponent(uri);
    router.push(`/analyze?uri=${encodedUri}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-5xl font-bold mb-4">PostgreSQL AI Optimizer</h1>
        <p className="text-gray-400 mb-8">
          Find and fix your database bottlenecks automatically.
        </p>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="Enter Your PostgreSQL Database URI"
            className="p-4 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLaunch}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg disabled:bg-gray-500"
          >
            {isLoading ? "Analyzing..." : "Launch Analysis"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className="text-sm text-yellow-500 mt-6 bg-yellow-900/20 p-3 rounded-lg">
          <span className="font-bold">For your safety:</span> We strongly
          recommend using a user with{" "}
          <span className="font-mono">read-only</span> permissions.
        </p>
      </div>
    </main>
  );
}
