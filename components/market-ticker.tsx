"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TickerItem {
  name: string;
  value: string;
  change: string;
  percent: string;
  isPositive: boolean;
}

const FALLBACK_DATA: TickerItem[] = [
  { name: "SENSEX", value: "76,704.13", change: "+633.29", percent: "+0.83%", isPositive: true },
  { name: "NIFTY", value: "23,777.80", change: "+196.65", percent: "+0.83%", isPositive: true },
  { name: "BANKNIFTY", value: "55,326.05", change: "+450.05", percent: "+0.82%", isPositive: true },
  { name: "NIFTYIT", value: "29,559.30", change: "-798.40", percent: "-2.63%", isPositive: false },
];

function TickerEntry({ item }: { item: TickerItem }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 whitespace-nowrap">
      <span className="text-[13px] font-semibold text-zinc-300 tracking-wide uppercase">
        {item.name}
      </span>
      <span
        className={`text-[13px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
          item.isPositive
            ? "text-emerald-400 bg-emerald-500/10"
            : "text-rose-400 bg-rose-500/10"
        }`}
      >
        {item.value}
      </span>
      <span className="inline-flex items-center gap-0.5">
        {item.isPositive ? (
          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-rose-400" />
        )}
        <span
          className={`text-xs font-medium tabular-nums ${
            item.isPositive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {item.change} ({item.percent})
        </span>
      </span>
    </span>
  );
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_DATA);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const res = await fetch("/api/market/indices");
        if (!res.ok) return;
        const json = await res.json();
        if (json.indices && json.indices.length > 0) {
          const mapped: TickerItem[] = json.indices.map((idx: any) => ({
            name: idx.name.toUpperCase().replace(" ", ""),
            value: idx.value,
            change: idx.change,
            percent: idx.percent,
            isPositive: idx.isPositive,
          }));
          // Append BANKNIFTY and NIFTYIT from fallback since API only returns Nifty/Sensex
          setItems([...mapped, ...FALLBACK_DATA.slice(2)]);
        }
      } catch {
        // Keep fallback
      }
    }
    fetchTicker();
    const interval = setInterval(fetchTicker, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items, ...items];

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800/60 overflow-hidden relative z-40">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      <div className="py-2 ticker-scroll">
        <div className="inline-flex items-center animate-marquee">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center">
              <TickerEntry item={item} />
              <span className="text-zinc-700 mx-2">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
