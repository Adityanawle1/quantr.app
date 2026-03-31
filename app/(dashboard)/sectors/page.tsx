"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, TrendingUp, TrendingDown, Loader2, Globe, Activity, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const colorTier = (perf: number) => {
  if (perf >= 2) return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' };
  if (perf >= 0.5) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-300' };
  if (perf >= -0.5) return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-300' };
  if (perf >= -2) return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-300' };
  return { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400' };
};

export default function SectorsPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<'nifty50' | 'sensex'>('nifty50');

  // Fetch Sectors
  const { data: sectorData, isLoading: sectorsLoading } = useQuery({
    queryKey: ["sectors-analysis"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/sectors");
      return res.json();
    },
    refetchInterval: 120000,
  });

  // Fetch Live Indices Constituents
  const { data: indexData, isLoading: indexLoading } = useQuery({
    queryKey: ["index-constituents", activeIndex],
    queryFn: async () => {
      const res = await fetch(`/api/indices/${activeIndex}`);
      return res.json();
    },
    refetchInterval: 120000,
  });

  const sectors = sectorData?.sectors || [];
  const constituents = indexData?.constituents || [];

  return (
    <main className="p-6 md:p-8 md:pb-16 flex-1 w-full max-w-[1400px] mx-auto text-zinc-50 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="border-b border-border-subtle pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-jakarta tracking-tight text-t1 mb-2">Market Indices & Sectors</h1>
          <p className="text-[#8A9DB8] font-medium max-w-2xl">
            Live auto-updating constituent tracking for major Indian indices, featuring a comparative macroeconomic sector strength heatmap.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-navy-card border border-border-subtle p-1 rounded-xl shrink-0">
           <button 
             onClick={() => setActiveIndex('nifty50')}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeIndex === 'nifty50' ? 'bg-blue-500 text-t1 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-t3 hover:text-t1'}`}
           >
             NIFTY 50
           </button>
           <button 
             onClick={() => setActiveIndex('sensex')}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeIndex === 'sensex' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-t3 hover:text-t1'}`}
           >
             BSE SENSEX
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: LIVE CONSTITUENTS */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold tracking-widest uppercase text-t3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 
              {activeIndex === 'nifty50' ? 'NIFTY 50' : 'SENSEX'} Live Constituents
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-t3">Auto-Updating via NSE</span>
            </div>
          </div>

          <div className="bg-navy-card/40 border border-border-subtle rounded-[24px] p-6 min-h-[500px]">
             {indexLoading ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="font-mono text-[10px] tracking-widest text-t3 uppercase">Fetching latest components...</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {constituents.map((c: any) => {
                    const isPositive = c.change >= 0;
                    return (
                      <div 
                        key={c.symbol} 
                        onClick={() => router.push(`/stocks/${c.symbol}`)}
                        className="bg-[#0B101A]/50 border border-border-subtle p-4 rounded-[16px] cursor-pointer hover:bg-white/[0.04] hover:border-border-subtle transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold font-mono text-t1 group-hover:text-blue-400 transition-colors truncate">{c.symbol}</span>
                          <span className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(c.change).toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-[11px] text-t3 truncate mb-3">{c.name}</div>
                        <div className="font-mono text-[13px] font-semibold text-t1">
                          ₹{c.price?.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </div>
                      </div>
                    )
                  })}
                </div>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN: SECTOR HEATMAP */}
        <div className="xl:col-span-4 space-y-6">
          <h2 className="text-[14px] font-bold tracking-widest uppercase text-t3 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> 
            Macro Sector Heatmap
          </h2>

          <div className="bg-navy-card/40 border border-border-subtle rounded-[24px] p-6 min-h-[500px] flex flex-col">
            {sectorsLoading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="font-mono text-[10px] tracking-widest text-t3 uppercase">Analyzing Sectors...</p>
              </div>
            ) : sectors.length === 0 ? (
               <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
                 <Boxes className="w-12 h-12 text-t3 opacity-40 mx-auto" />
                 <p className="text-t3 font-mono text-[11px]">No sector data available.<br/>Ensure stock database is populated.</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 flex-1 h-full">
                {sectors.map((sector: any) => {
                  const tier = colorTier(sector.performance);
                  const isPositive = sector.performance >= 0;
                  
                  return (
                    <div
                      key={sector.name}
                      className={`p-5 rounded-[16px] border flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:brightness-125 ${tier.bg} ${tier.border}`}
                    >
                      <div className="font-mono text-[10px] font-semibold text-t1/50 uppercase tracking-widest leading-tight mb-4">
                        {sector.name}
                      </div>
                      <div>
                        <div className={`font-jakarta text-2xl font-black tracking-tight ${tier.text}`}>
                          {isPositive ? '+' : ''}{sector.performance.toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {isPositive ? (
                            <TrendingUp className={`w-3.5 h-3.5 ${tier.text} opacity-60`} />
                          ) : (
                            <TrendingDown className={`w-3.5 h-3.5 ${tier.text} opacity-60`} />
                          )}
                          <span className="font-mono text-[9px] text-t1/40 tracking-[1px] uppercase">Daily Avg</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
