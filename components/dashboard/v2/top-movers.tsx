"use client";

import { useMovers } from "@/hooks/use-market-data";
import Link from "next/link";

export function TopMovers() {
  const { data, isLoading } = useMovers();

  if (isLoading) {
    return (
      <div className="bg-navy-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border-subtle">
          <div className="h-4 w-24 bg-navy-surf rounded animate-pulse" />
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle last:border-0">
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-navy-surf rounded animate-pulse" />
              <div className="h-2 w-24 bg-navy-surf rounded animate-pulse" />
            </div>
            <div className="h-3 w-12 bg-navy-surf rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const { topGainers = [], topLosers = [] } = data || {};

  return (
    <div className="flex flex-col gap-3">
      <MoverList title="Gainers" items={topGainers} isGain />
      <MoverList title="Losers" items={topLosers} isGain={false} />
    </div>
  );
}

function MoverList({ title, items, isGain }: { title: string, items: any[], isGain: boolean }) {
  return (
    <div className="bg-navy-card border border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
        <span className="text-[12px] font-semibold text-t1">{title}</span>
        <span className="text-[10px] text-t3 font-mono">Nifty 50</span>
      </div>

      {/* Rows */}
      <div>
        {items.slice(0, 5).map((s: any, i: number) => (
          <Link
            href={`/stocks/${s.symbol}`}
            key={s.symbol}
            className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle last:border-0 hover:bg-navy-surf transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[10px] text-t3/50 font-mono w-3 shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-t1 group-hover:text-blue-400 transition-colors truncate">{s.symbol}</div>
                <div className="text-[10px] text-t3 truncate max-w-[110px]">{s.name}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[11px] text-t2">₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</div>
              <div className={`font-mono text-[11px] font-semibold ${isGain ? 'text-gain' : 'text-loss'}`}>
                {isGain ? '+' : ''}{s.changePercent.toFixed(2)}%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
