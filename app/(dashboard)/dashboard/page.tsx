"use client";

import { useState, useEffect } from "react";
import { IndexCards } from "@/components/dashboard/v2/index-cards";
import { MarketChart } from "@/components/dashboard/v2/market-chart";
import { PortfolioSummary } from "@/components/dashboard/v2/portfolio-summary";
import { SectorHeatmap } from "@/components/dashboard/v2/sector-heatmap";
import { TopMovers } from "@/components/dashboard/v2/top-movers";
import { MarketInternals } from "@/components/dashboard/v2/market-internals";
import SearchBar from "@/components/search/SearchBar";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const [dateStr, setDateStr] = useState("");

  const { data: marketData } = useSWR('/api/market-status', fetcher, { refreshInterval: 60000 });
  const marketStatus = marketData?.status || 'UNKNOWN';
  const isOpen = marketStatus === 'OPEN';

  useEffect(() => {
    const updateDT = () => {
      const n = new Date();
      const d = n.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      const t = n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      setDateStr(`${d}, ${t} IST`);
    };
    updateDT();
    const interval = setInterval(updateDT, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 md:p-5 md:pb-16 flex-1 w-full max-w-[1400px] mx-auto bg-navy text-zinc-50 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-4 opacity-0 animate-[fu_0.4s_ease_forwards] [animation-delay:0.05s] relative z-50">
        <div className="shrink-0">
          <div className="flex items-center gap-2.5 mb-0.5">
            <h1 className="text-[22px] font-bold text-t1 tracking-tight">Dashboard</h1>
            {marketStatus !== 'UNKNOWN' && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isOpen ? 'text-gain border-gain/25 bg-gain/8' : 'text-t3 border-border-subtle bg-navy-surf'}`}>
                {isOpen ? '● NSE Open' : '○ Market Closed'}
              </span>
            )}
          </div>
          <div className="text-[12px] text-t3 font-mono">{dateStr || '—'}</div>
        </div>

        <div className="flex-1 w-full max-w-lg">
          <SearchBar className="m-0" />
        </div>
      </div>

      {/* Index cards */}
      <div className="opacity-0 animate-[fu_0.4s_ease_forwards] [animation-delay:0.12s]">
        <IndexCards />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 opacity-0 animate-[fu_0.4s_ease_forwards] [animation-delay:0.22s]">

        {/* Left: Portfolio + Movers */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <PortfolioSummary />
          <TopMovers />
        </div>

        {/* Center: Chart + Sectors */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <MarketChart />
          <SectorHeatmap />
        </div>

        {/* Right: Market Internals */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <MarketInternals />
        </div>

      </div>
    </main>
  );
}
