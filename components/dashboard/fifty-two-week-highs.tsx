"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface StockHigh {
  symbol: string;
  price: number;
  market_cap: number;
}

export function FiftyTwoWeekHighs() {
  const [highs, setHighs] = useState<StockHigh[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/highs");
        const json = await res.json();
        setHighs(json.highs || []);
      } catch {
        console.error("Failed to load 52-week highs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatVolume(cap: number): string {
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)}T`;
    if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)}B`;
    if (cap >= 1e6) return `${(cap / 1e6).toFixed(1)}M`;
    return cap.toLocaleString();
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-zinc-50">52-Week Highs</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </div>
        <CardDescription className="text-xs">Stocks hitting yearly extremes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-t3 text-sm">Loading...</div>
        ) : (
          <div className="space-y-4 mt-2">
            {highs.map((stock) => (
              <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="flex justify-between items-center group cursor-pointer hover:bg-zinc-800/50 p-1 -mx-1 rounded transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 group-hover:border-zinc-500 transition-colors">
                    {stock.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-zinc-100 text-sm">{stock.symbol}</div>
                    <div className="text-xs text-t3">MCap: {formatVolume(Number(stock.market_cap))}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-zinc-100 text-sm">₹{Number(stock.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
