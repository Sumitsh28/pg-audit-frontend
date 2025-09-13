import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PG Optimizer AI",
  description: "AI-powered PostgreSQL Performance Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased dark",
          inter.variable
        )}
      >
        <main className="flex flex-col items-center p-4 md:p-24">
          {children}
        </main>
      </body>
    </html>
  );
}
