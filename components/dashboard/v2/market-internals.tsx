"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface InternalStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  fiftyTwoWeekHigh: number;
}

export function MarketInternals() {
  const { data, isLoading } = useQuery<{ active: InternalStock[], highs: InternalStock[] }>({
    queryKey: ["dashboard-internals"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/internals");
      if (!res.ok) throw new Error("Failed to fetch internals");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const formatVolume = (vol: number) => {
    if (vol >= 10000000) return (vol / 10000000).toFixed(2) + 'Cr';
    if (vol >= 100000) return (vol / 100000).toFixed(2) + 'L';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'k';
    return vol.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-navy-card border border-border-subtle rounded-md shadow-sm h-full min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-t3" />
      </div>
    );
  }

  const active = data?.active || [];
  const highs = data?.highs || [];

  return (
    <div className="flex flex-col h-full bg-navy border-x border-t border-border-subtle rounded-md overflow-hidden">
      
      {/* MOST ACTIVE / UNUSUAL VOLUME */}
      <div className="flex-1">
        <div className="flex items-center gap-2 p-3 bg-navy-surf border-b border-border-subtle font-sans text-xs font-bold text-t1 tracking-wide uppercase">
          <Activity className="w-3.5 h-3.5 text-blue-500" />
          Most Active (Volume)
        </div>
        <div className="flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-4 px-3 py-2 border-b border-border-subtle bg-navy text-[10px] uppercase font-bold text-t3 tracking-wider">
            <div className="col-span-2">Ticker</div>
            <div className="text-right">Price</div>
            <div className="text-right">Volume</div>
          </div>
          
          {active.slice(0, 7).map((s, i) => {
            const isUp = s.changePercent >= 0;
            return (
              <Link href={`/stocks/${s.symbol}`} key={i} className="grid grid-cols-4 px-3 py-2.5 border-b border-border-subtle hover:bg-highlight-hov transition-colors group cursor-pointer items-center">
                <div className="col-span-2 flex flex-col justify-center">
                  <div className="font-sans text-[11px] font-bold text-blue-400 truncate pr-2" title={s.name}>
                    {s.symbol.replace('.NS', '').replace('.BO', '')}
                  </div>
                  <div className="font-sans text-[9px] text-t3 uppercase font-medium truncate mt-0.5" title={s.name}>{s.name}</div>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span className="font-mono text-[11px] font-bold text-t1">{s.price.toFixed(1)}</span>
                  <span className={`font-mono text-[10px] font-bold mt-0.5 ${isUp ? 'text-gain' : 'text-loss'}`}>
                    {isUp ? '+' : ''}{s.changePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right font-mono text-[11px] font-bold text-t2 flex flex-col justify-center gap-0.5">
                    <span className="bg-blue-500/10 text-blue-400 px-1 py-0.5 rounded ml-auto">{formatVolume(s.volume)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* NEAR 52 WEEK HIGHS */}
      <div className="flex-1 border-t border-border-strong mt-4">
        <div className="flex items-center gap-2 p-3 bg-navy-surf border-b border-border-subtle font-sans text-xs font-bold text-t1 tracking-wide uppercase">
          <ArrowUpRight className="w-3.5 h-3.5 text-gain" />
          Near 52-Week Highs
        </div>
        <div className="flex flex-col border-b border-border-subtle">
           {/* Header Row */}
           <div className="grid grid-cols-4 px-3 py-2 border-b border-border-subtle bg-navy text-[10px] uppercase font-bold text-t3 tracking-wider">
            <div className="col-span-2">Ticker</div>
            <div className="text-right">Price</div>
            <div className="text-right">52W High</div>
          </div>
          
          {highs.slice(0, 7).map((s, i) => {
            const isUp = s.changePercent >= 0;
            return (
              <Link href={`/stocks/${s.symbol}`} key={i} className="grid grid-cols-4 px-3 py-2.5 border-b border-border-subtle hover:bg-highlight-hov transition-colors group cursor-pointer items-center">
                <div className="col-span-2 flex flex-col justify-center">
                   <div className="font-sans text-[11px] font-bold text-blue-400 truncate pr-2" title={s.name}>
                    {s.symbol.replace('.NS', '').replace('.BO', '')}
                  </div>
                  <div className="font-sans text-[9px] text-t3 uppercase font-medium truncate mt-0.5" title={s.name}>{s.name}</div>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span className="font-mono text-[11px] font-bold text-t1">{s.price.toFixed(1)}</span>
                  <span className={`font-mono text-[10px] font-bold mt-0.5 ${isUp ? 'text-gain' : 'text-loss'}`}>
                    {isUp ? '+' : ''}{s.changePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right font-mono text-[11px] font-bold text-t2 flex flex-col justify-center">
                    <span className="text-t1">{s.fiftyTwoWeekHigh.toFixed(1)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  );
}
