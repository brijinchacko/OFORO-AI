"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="px-6 py-3 text-sm font-medium rounded-lg" style={{ background: "var(--accent)", color: "#fff" }}>
        Try again
      </button>
    </div>
  );
}
