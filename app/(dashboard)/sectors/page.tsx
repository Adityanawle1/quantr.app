"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, TrendingUp, TrendingDown, Loader2, Globe, Activity, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SECTOR_LABELS: Record<string, string> = {
  'unknown': 'Mixed',
  'UNKNOWN': 'Mixed',
  'undefined': 'Other',
  '': 'Other',
  'financialservices': 'Financials',
  'financial_services': 'Financials',
  'Financial Services': 'Financials',
  'it': 'IT',
  'IT': 'IT',
  'information_technology': 'IT',
  'Information Technology': 'IT',
  'healthcare': 'Healthcare',
  'Health Care': 'Healthcare',
  'consumer_discretionary': 'Consumer',
  'Consumer Discretionary': 'Consumer',
  'consumer_staples': 'FMCG',
  'Consumer Staples': 'FMCG',
  'energy': 'Energy',
  'Energy': 'Energy',
  'materials': 'Materials',
  'Materials': 'Materials',
  'industrials': 'Industrials',
  'Industrials': 'Industrials',
  'utilities': 'Utilities',
  'Utilities': 'Utilities',
  'real_estate': 'Realty',
  'Real Estate': 'Realty',
  'communication_services': 'Telecom',
  'Communication Services': 'Telecom',
  'automobile': 'Auto',
  'Automobile': 'Auto',
  'metals': 'Metals',
  'Metals & Mining': 'Metals',
  'pharma': 'Pharma',
  'Pharmaceuticals': 'Pharma',
  'banking': 'Banking',
  'Bank': 'Banking',
  'fmcg': 'FMCG',
  'FMCG': 'FMCG',
};

const displayName = (sector: string) => 
  SECTOR_LABELS[sector] ?? 
  SECTOR_LABELS[sector?.toLowerCase()] ?? 
  sector ?? 
  'Other';

const colorTier = (perf: number) => {
  if (perf >= 2) return { 
    bg: 'bg-[rgba(22,163,74,0.1)] dark:bg-emerald-500/20', 
    border: 'border-[rgba(22,163,74,0.25)] dark:border-emerald-500/40', 
    text: 'text-[#16a34a] dark:text-emerald-400',
    label: 'text-[#15803d] dark:text-t1/50'
  };
  if (perf >= 0.5) return { 
    bg: 'bg-[rgba(22,163,74,0.06)] dark:bg-emerald-500/10', 
    border: 'border-[rgba(22,163,74,0.15)] dark:border-emerald-500/20', 
    text: 'text-[#16a34a] dark:text-emerald-300',
    label: 'text-[#15803d] dark:text-t1/50'
  };
  if (perf >= -0.5) return { 
    bg: 'bg-[#f1f5f9] dark:bg-slate-500/10', 
    border: 'border-[rgba(0,0,0,0.08)] dark:border-slate-500/20', 
    text: 'text-[#64748b] dark:text-slate-300',
    label: 'text-[#475569] dark:text-t1/50'
  };
  if (perf >= -2) return { 
    bg: 'bg-[rgba(220,38,38,0.06)] dark:bg-rose-500/10', 
    border: 'border-[rgba(220,38,38,0.12)] dark:border-rose-500/20', 
    text: 'text-[#dc2626] dark:text-rose-300',
    label: 'text-[#b91c1c] dark:text-t1/50'
  };
  return { 
    bg: 'bg-[rgba(220,38,38,0.1)] dark:bg-rose-500/20', 
    border: 'border-[rgba(220,38,38,0.2)] dark:border-rose-500/40', 
    text: 'text-[#dc2626] dark:text-rose-400',
    label: 'text-[#b91c1c] dark:text-t1/50'
  };
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
      
      <div className="border-b border-border-subtle pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-black font-jakarta tracking-tight text-t1 mb-2">Market Indices & Sectors</h1>
          <p className="text-t3 font-medium max-w-2xl">
            Live auto-updating constituent tracking for major Indian indices, featuring a comparative macroeconomic sector strength heatmap.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-background-primary border border-border-subtle p-1.5 rounded-xl shrink-0 shadow-sm">
           <button 
             onClick={() => setActiveIndex('nifty50')}
             className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${activeIndex === 'nifty50' ? 'bg-primary text-white shadow-md active:scale-95' : 'text-t3 hover:text-primary hover:bg-accent-blue-muted'}`}
           >
             NIFTY 50
           </button>
           <button 
             onClick={() => setActiveIndex('sensex')}
             className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${activeIndex === 'sensex' ? 'bg-primary text-white shadow-md active:scale-95' : 'text-t3 hover:text-primary hover:bg-accent-blue-muted border border-transparent hover:border-accent-blue-border'}`}
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

          <div className="bg-[#f8fafc] dark:bg-navy-card/40 border border-[rgba(0,0,0,0.06)] dark:border-border-subtle rounded-[24px] p-6 min-h-[500px]">
             {indexLoading ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                        className="bg-white dark:bg-[#0B101A]/50 border border-border-default dark:border-border-subtle p-4 rounded-xl cursor-pointer hover:bg-background-surface dark:hover:bg-white/[0.04] transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-bold text-[14px] text-t1 group-hover:text-primary transition-colors truncate">{c.symbol}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                            isPositive 
                              ? 'bg-[rgba(22,163,74,0.08)] text-[#16a34a] border-[rgba(22,163,74,0.15)]' 
                              : 'bg-[rgba(220,38,38,0.08)] text-[#dc2626] border-[rgba(220,38,38,0.15)]'
                          }`}>
                            {isPositive ? '+' : ''}{c.change?.toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-[12px] text-t3 truncate mb-3">{c.name}</div>
                        <div className="font-mono text-[16px] font-semibold text-t1">
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

          <div className="bg-[#f8fafc] dark:bg-navy-card/40 border border-[rgba(0,0,0,0.06)] dark:border-border-subtle rounded-[24px] p-6 min-h-[500px] flex flex-col transition-colors duration-300">
            {sectorsLoading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                      className={`p-5 rounded-[16px] border flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${tier.bg} ${tier.border}`}
                    >
                      <div className={`font-mono text-[11px] font-bold uppercase tracking-widest leading-tight mb-4 ${tier.label}`}>
                        {displayName(sector.name)}
                      </div>
                      <div>
                        <div className={`font-jakarta text-2xl font-black tracking-tight ${tier.text}`}>
                          {isPositive ? '+' : ''}{sector.performance.toFixed(2)}%
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {isPositive ? (
                            <TrendingUp className={`w-3.5 h-3.5 ${tier.text} opacity-60`} />
                          ) : (
                            <TrendingDown className={`w-3.5 h-3.5 ${tier.text} opacity-60`} />
                          )}
                          <span className={`font-mono text-[9px] font-bold tracking-[1px] uppercase opacity-40 ${tier.text}`}>Daily Avg</span>
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
