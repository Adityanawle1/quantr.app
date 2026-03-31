"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PriceChart } from "@/components/stock/price-chart";

interface IndexData {
  name: string;
  value: string;
  change: string;
  percent: string;
  isPositive: boolean;
  sparkline: number[];
  chartData: { time: string | number; value: number; open: number; high: number; low: number; close: number }[];
}

export function IndexCards() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/market/indices");
        const json = await res.json();
        setIndices(json.indices || []);
      } catch {
        console.error("Failed to load indices");
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
            <CardHeader className="pb-2"><div className="h-4 bg-zinc-800 rounded w-20" /></CardHeader>
            <CardContent><div className="h-8 bg-zinc-800 rounded w-32 mb-2" /><div className="h-3 bg-zinc-800 rounded w-24" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {indices.map((index) => (
        <Dialog key={index.name}>
          <DialogTrigger className="w-full text-left outline-none">
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:bg-zinc-800/80 transition-colors text-left">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-t2">
                  {index.name}
                </CardTitle>
                {index.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-50">{index.value}</div>
                <p className={`text-xs ${index.isPositive ? "text-emerald-500" : "text-rose-500"} flex items-center mt-1`}>
                  {index.change} ({index.percent})
                </p>
                {/* SVG Sparkline */}
                <div className="mt-4 h-[40px] w-full flex items-end overflow-hidden opacity-50">
                  <svg viewBox="0 0 100 40" className="w-full h-full preserve-aspect-ratio-none">
                    <path
                      d={`M ${index.sparkline.map((d, i) => `${i * (100 / (Math.max(1, index.sparkline.length - 1)))},${40 - ((d - Math.min(...index.sparkline)) / (Math.max(...index.sparkline) - Math.min(...index.sparkline) || 1)) * 40}`).join(" L ")}`}
                      fill="none"
                      stroke={index.isPositive ? "#10b981" : "#f43f5e"}
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-zinc-800 text-zinc-50">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span className="text-xl">{index.name}</span>
                <span className="text-2xl font-bold">{index.value}</span>
                <span className={`text-sm flex items-center ${index.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                  {index.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {index.change} ({index.percent})
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 h-[400px]">
              {index.chartData && index.chartData.length > 0 ? (
                <PriceChart data={index.chartData} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-t3">
                  No chart data available
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
