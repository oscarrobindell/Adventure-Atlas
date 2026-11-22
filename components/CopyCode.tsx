"use client";
import { useState } from "react";

export default function CopyCode({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(code); setDone(true); setTimeout(() => setDone(false), 1600); }}
      className="font-mono text-sm border border-dashed border-ember/60 text-ember px-3 py-1.5 hover:bg-ember hover:text-ink transition-colors"
      aria-label={`Copy code ${code}`}>
      {done ? "Copied" : code}
    </button>
  );
}
