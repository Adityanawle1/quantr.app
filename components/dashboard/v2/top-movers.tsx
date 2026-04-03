"use client";

import { useMovers } from "@/hooks/use-market-data";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export function TopMovers() {
  const { data, isLoading } = useMovers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-navy-card border border-border-subtle rounded-[4px] h-[320px] animate-pulse" />
        <div className="bg-navy-card border border-border-subtle rounded-[4px] h-[320px] animate-pulse" />
      </div>
    );
  }

  const { topGainers = [], topLosers = [] } = data || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top Gainers */}
      <div className="flex flex-col">
        <div className="px-1 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gain" />
            </div>
            <h3 className="font-display text-[18px] font-semibold tracking-tight text-t1 mb-0.5">Top Gainers</h3>
          </div>
          <span className="text-[11px] text-t2 font-medium bg-black/20 px-2 py-1 rounded">Nifty 50</span>
        </div>
        
        <div className="flex-1">
          {topGainers.map((s: any, i: number) => (
            <Link href={`/stocks/${s.symbol}`} key={s.symbol} className="py-4 border-b border-white/5 hover:bg-[rgba(255,255,255,0.02)] transition-colors flex items-center justify-between group -mx-2 px-2 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-t3 w-4 opacity-50">{i + 1}</span>
                <div>
                  <div className="text-[14px] font-semibold text-t1 group-hover:text-gain transition-colors">{s.symbol}</div>
                  <div className="text-[12px] text-t2 font-medium max-w-[140px] truncate">{s.name}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-mono text-[12px] font-semibold text-t1">₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5 text-gain" />
                  <span className="font-mono text-[10px] text-gain font-bold">+{s.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="flex flex-col mt-6 md:mt-0">
        <div className="px-1 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-loss" />
            </div>
            <h3 className="font-display text-[18px] font-semibold tracking-tight text-t1 mb-0.5">Top Losers</h3>
          </div>
          <span className="text-[11px] text-t2 font-medium bg-black/20 px-2 py-1 rounded">Nifty 50</span>
        </div>
        
        <div className="flex-1">
          {topLosers.map((s: any, i: number) => (
            <Link href={`/stocks/${s.symbol}`} key={s.symbol} className="py-4 border-b border-white/5 hover:bg-[rgba(255,255,255,0.02)] transition-colors flex items-center justify-between group -mx-2 px-2 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-t3 w-4 opacity-50">{i + 1}</span>
                <div>
                  <div className="text-[14px] font-semibold text-t1 group-hover:text-loss transition-colors">{s.symbol}</div>
                  <div className="text-[12px] text-t2 font-medium max-w-[140px] truncate">{s.name}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-mono text-[12px] font-semibold text-t1">₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <ArrowDownRight className="w-2.5 h-2.5 text-loss" />
                  <span className="font-mono text-[10px] text-loss font-bold">{s.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
