"use client";

import { Search } from "lucide-react";

export function HeroSection() {
  const openSearch = () => {
    // Trigger the ⌘K search dialog
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden flex flex-col items-center justify-center">
      {/* Background glowing grid */}
      <div className="absolute inset-0 glow-grid opacity-50 pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-400">
            Smarter stock screening for India
          </h1>
          <p className="mx-auto max-w-[700px] text-t2 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Screen, analyze, and discover high-quality Indian stocks in seconds.
          </p>
        </div>

        {/* macOS Spotlight Style Search */}
        <div className="w-full max-w-2xl mx-auto relative group mt-8 cursor-pointer" onClick={openSearch}>
          <div className="absolute inset-0 bg-zinc-400/10 blur-xl rounded-2xl group-hover:bg-zinc-400/20 transition-all duration-500 opacity-50" />
          <div className="relative flex items-center bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl p-2 transition-all group-hover:border-zinc-700">
            <Search className="w-6 h-6 ml-3 text-t2" />
            <div className="text-lg md:text-xl text-t3 h-14 w-full pl-4 flex items-center select-none">
              Search stocks, sectors, or indices (e.g., Reliance, TCS, Nifty 50)
            </div>
            <div className="mr-2 px-3 py-1 flex items-center justify-center bg-zinc-800 rounded-md text-xs font-medium text-t2 border border-zinc-700 shrink-0">
              ⌘ K
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
