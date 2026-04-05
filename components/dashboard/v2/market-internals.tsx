"use client";

import { useQuery } from "@tanstack/react-query";
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

function fmtVol(vol: number) {
  if (vol >= 10000000) return (vol / 10000000).toFixed(1) + 'Cr';
  if (vol >= 100000) return (vol / 100000).toFixed(1) + 'L';
  if (vol >= 1000) return (vol / 1000).toFixed(0) + 'k';
  return vol.toString();
}

function StockTable({ title, items, col3Label, col3Render }: {
  title: string;
  items: InternalStock[];
  col3Label: string;
  col3Render: (s: InternalStock) => React.ReactNode;
}) {
  return (
    <div>
      <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between">
        <span className="text-[12px] font-semibold text-t1">{title}</span>
      </div>
      {/* Col headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-1.5 border-b border-border-subtle">
        <span className="text-[9px] text-t3 uppercase tracking-wider font-medium">Name</span>
        <span className="text-[9px] text-t3 uppercase tracking-wider font-medium text-right">Chg%</span>
        <span className="text-[9px] text-t3 uppercase tracking-wider font-medium text-right">{col3Label}</span>
      </div>
      {items.slice(0, 7).map((s, i) => {
        const isUp = s.changePercent >= 0;
        return (
          <Link
            href={`/stocks/${s.symbol.replace('.NS', '').replace('.BO', '')}`}
            key={i}
            className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2 border-b border-border-subtle last:border-0 hover:bg-navy-surf transition-colors group"
          >
            <div className="min-w-0">
              <div className="font-mono text-[11px] font-semibold text-t1 group-hover:text-blue-400 transition-colors truncate">
                {s.symbol.replace('.NS', '').replace('.BO', '')}
              </div>
              <div className="text-[9px] text-t3 truncate mt-0.5">{s.name}</div>
            </div>
            <span className={`font-mono text-[11px] font-semibold self-center ${isUp ? 'text-gain' : 'text-loss'}`}>
              {isUp ? '+' : ''}{s.changePercent.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-t2 self-center text-right">
              {col3Render(s)}
            </span>
          </Link>
        );
      })}
    </div>
  );
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

  if (isLoading) {
    return (
      <div className="bg-navy-card border border-border-subtle rounded-lg overflow-hidden h-full">
        <div className="p-3 border-b border-border-subtle animate-pulse">
          <div className="h-4 w-28 bg-navy-surf rounded" />
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle animate-pulse">
            <div className="space-y-1">
              <div className="h-3 w-14 bg-navy-surf rounded" />
              <div className="h-2 w-20 bg-navy-surf rounded" />
            </div>
            <div className="h-3 w-10 bg-navy-surf rounded" />
          </div>
        ))}
      </div>
    );
  }

  const active = data?.active || [];
  const highs = data?.highs || [];

  return (
    <div className="bg-navy-card border border-border-subtle rounded-lg overflow-hidden h-full flex flex-col">
      <StockTable
        title="Most Active"
        items={active}
        col3Label="Vol"
        col3Render={(s) => fmtVol(s.volume)}
      />
      <div className="border-t border-border-strong mt-1" />
      <StockTable
        title="Near 52W High"
        items={highs}
        col3Label="High"
        col3Render={(s) => s.fiftyTwoWeekHigh.toFixed(0)}
      />
    </div>
  );
}
