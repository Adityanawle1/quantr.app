"use client";

import { Loader2, Database } from "lucide-react";
import { useEffect, useState } from "react";

export function SyncingState() {
  const [message, setMessage] = useState("Initializing sync...");

  useEffect(() => {
    const messages = [
      "Mapping CSV columns...",
      "Resolving ticker symbols...",
      "Updating portfolio records...",
      "Analyzing latest market data...",
      "Finalizing...",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setMessage(messages[idx]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center max-w-sm w-full">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative shadow-2xl">
            <Database className="w-8 h-8 text-emerald-500 animate-pulse" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-t2 animate-spin" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-medium text-t1 mb-2">Syncing Portfolio</h2>
        <p className="text-sm text-t2 animate-pulse">{message}</p>
        
        <div className="w-64 h-1 bg-zinc-900 rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-emerald-500 w-1/3 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); width: 200%; }
          100% { transform: translateX(300%); }
        }
      `}} />
    </div>
  );
}
