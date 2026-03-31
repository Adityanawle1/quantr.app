"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import Link from "next/link";

interface StockMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export function TopMovers() {
  const [gainers, setGainers] = useState<StockMover[]>([]);
  const [losers, setLosers] = useState<StockMover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        setGainers(json.gainers || []);
        setLosers(json.losers || []);
      } catch {
        console.error("Failed to load top movers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-zinc-50">Top Movers</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="gainers" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-950">
            <TabsTrigger value="gainers" className="data-[state=active]:bg-zinc-800">Gainers</TabsTrigger>
            <TabsTrigger value="losers" className="data-[state=active]:bg-zinc-800">Losers</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="mt-4">
            {loading ? (
              <div className="text-t3 text-sm">Loading...</div>
            ) : (
              <div className="space-y-4">
                {gainers.map((stock) => (
                  <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="flex justify-between items-center group cursor-pointer hover:bg-zinc-800/50 p-1 -mx-1 rounded transition-colors">
                    <div>
                      <div className="font-medium text-zinc-100">{stock.symbol}</div>
                      <div className="text-xs text-t3">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-zinc-100">{Number(stock.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-emerald-500">+{stock.change}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="losers" className="mt-4">
            {loading ? (
              <div className="text-t3 text-sm">Loading...</div>
            ) : (
              <div className="space-y-4">
                {losers.map((stock) => (
                  <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} className="flex justify-between items-center group cursor-pointer hover:bg-zinc-800/50 p-1 -mx-1 rounded transition-colors">
                    <div>
                      <div className="font-medium text-zinc-100">{stock.symbol}</div>
                      <div className="text-xs text-t3">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-zinc-100">{Number(stock.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-rose-500">{stock.change}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
