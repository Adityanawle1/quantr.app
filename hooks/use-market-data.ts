"use client";

import { useQuery } from "@tanstack/react-query";

export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: any[];
}

export interface MoverData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketMovers {
  topGainers: MoverData[];
  topLosers: MoverData[];
}

export function useIndices() {
  return useQuery<IndexData[]>({
    queryKey: ["indices"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/indices");
      if (!res.ok) throw new Error("Failed to fetch indices");
      return res.json();
    },
    refetchInterval: 30000, // 30 seconds
  });
}

export function useMovers() {
  return useQuery<MarketMovers>({
    queryKey: ["movers"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/movers");
      if (!res.ok) throw new Error("Failed to fetch movers");
      return res.json();
    },
    refetchInterval: 60000, // 60 seconds
  });
}
