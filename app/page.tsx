"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DbUriForm from "@/components/DbUriForm";
import { ChevronDownIcon, SparkleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workflow } from "./dashboard/components/Workflow";
import logo from "@/public/logo.png";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  const [dbType, setDbType] = useState<"postgresql" | "mysql">("postgresql");
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
    sessionStorage.setItem("dbType", JSON.stringify(dbType));
    sessionStorage.setItem("dbUri", JSON.stringify(dbUri));
    sessionStorage.setItem("writeDbUri", JSON.stringify(writeDbUri));
    router.push("/dashboard");
  };

  const colors = [
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#a3e635",
    "#4ade80",
    "#34d399",
    "#22d3ee",
    "#60a5fa",
    "#818cf8",
    "#c084fc",
    "#f472b6",
  ];

  const bars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    height: Math.floor(Math.random() * 60 + 15),
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.025,
      },
    },
  };

  const barVariants = {
    initial: {
      scaleY: 0.5,
      opacity: 0,
    },
    animate: {
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col w-screen">
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <nav className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center bg-black/40 backdrop-blur-lg rounded-full border border-white/10 shadow-lg">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="DB Scope Logo"
              width={100}
              height={100}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors">
              Try Now
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-16 px-4">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">
            Tired of endless manual query optimizations?
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
            DB Scope automates query analysis, detects bottlenecks, and
            recommends fixes, saving you hours of debugging and guesswork.
          </p>
        </section>

        <section className="mt-20 w-full max-w-full relative">
          <motion.div
            className="absolute inset-x-0 bottom-0 h-48 sm:h-64 flex items-end justify-center gap-1.5 overflow-hidden pointer-events-none"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {bars.map((bar) => (
              <motion.div
                key={bar.id}
                className="w-4 rounded-full origin-bottom"
                style={{
                  height: `${bar.height}%`,
                  backgroundColor: bar.color,
                }}
                variants={barVariants}
              />
            ))}
          </motion.div>

          <main className="relative z-10 flex flex-col items-center justify-center p-4">
            <DbUriForm
              dbType={dbType}
              setDbType={setDbType}
              readUri={dbUri}
              setReadUri={setDbUri}
              writeUri={writeDbUri}
              setWriteUri={setWriteDbUri}
              onConnect={handleConnect}
              isConnecting={isConnecting}
              error={connectionError}
            />
          </main>
        </section>
        <Workflow />
      </main>
    </div>
  );
}
