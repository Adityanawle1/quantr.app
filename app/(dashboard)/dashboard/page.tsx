"use client";

import { useState, useEffect } from "react";
import { IndexCards } from "@/components/dashboard/v2/index-cards";
import { MarketChart } from "@/components/dashboard/v2/market-chart";
import { PortfolioSummary } from "@/components/dashboard/v2/portfolio-summary";
import { SectorHeatmap } from "@/components/dashboard/v2/sector-heatmap";
import { TopMovers } from "@/components/dashboard/v2/top-movers";
import { MarketInternals } from "@/components/dashboard/v2/market-internals";
import SearchBar  from "@/components/search/SearchBar";
import { X } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const [dateStr, setDateStr] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  
  const { data: marketData } = useSWR('/api/market-status', fetcher, { refreshInterval: 60000 });
  const marketStatus = marketData?.status || 'UNKNOWN';
  const isOpen = marketStatus === 'OPEN';

  useEffect(() => {
    const updateDT = () => {
      const n = new Date();
      const d = n.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
      const t = n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      setDateStr(`${d} · ${t} IST`);
    };
    updateDT();
    const interval = setInterval(updateDT, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 md:p-5 md:pb-16 flex-1 w-full max-w-[1400px] mx-auto bg-navy text-zinc-50 font-sans">
      
      {/* Overview Head with Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 opacity-0 animate-[fu_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] [animation-delay:0.05s] relative z-50">
        <div className="shrink-0 mb-4 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8A9DB8]">Real-Time Diagnostics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-jakarta tracking-tighter text-t1 mb-1">
            Market Dashboard
          </h1>
          <div className="font-mono text-xs text-t3 flex items-center gap-2 mt-2">
             <div className="h-px w-4 bg-border-strong hidden md:block" /> 
             {dateStr || "Loading..."}
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-xl">
          <SearchBar className="m-0" />
        </div>

        {marketStatus !== 'UNKNOWN' && (
          <div className={`hidden lg:flex shrink-0 items-center justify-center gap-2 font-mono text-[10px] border rounded-full px-3 py-1.5 mt-auto mb-1 ${isOpen ? 'text-gain bg-gaindm border-gainbr' : 'text-loss bg-loss/10 border-loss/20'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-gain animate-[plsanim_2s_ease_infinite]' : 'bg-loss'}`} />
            NSE & BSE {marketStatus}
          </div>
        )}
      </div>

      {/* Index Summary Cards */}
      <div className="opacity-0 animate-[fu_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] [animation-delay:0.20s]">
        <IndexCards />
      </div>

      {/* 3-Column Dense Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 opacity-0 animate-[fu_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] [animation-delay:0.28s]">
        
        {/* LEFT COLUMN: Portfolio & Movers */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          <PortfolioSummary />
          <TopMovers />
        </div>

        {/* CENTER COLUMN: Chart & Heatmap */}
        <div className="lg:col-span-6 flex flex-col gap-3.5">
          <MarketChart />
          <SectorHeatmap />
        </div>

        {/* RIGHT COLUMN: Market Internals (Screener Data) */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          <MarketInternals />
        </div>

      </div>

    </main>
  );
}
