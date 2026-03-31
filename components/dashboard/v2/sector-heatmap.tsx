"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface SectorData {
  name: string;
  performance: number;
}

const colorTier = (perf: number) => {
  if (perf >= 2) return 'bg-[rgba(61,214,140,0.17)] border-[rgba(61,214,140,0.27)] text-[#3DD68C]';
  if (perf >= 0.5) return 'bg-[rgba(61,214,140,0.09)] border-[rgba(61,214,140,0.15)] text-[#7EDEB0]';
  if (perf >= -0.5) return 'bg-[rgba(91,156,246,0.07)] border-[rgba(91,156,246,0.13)] text-[#93C5FD]';
  if (perf >= -2) return 'bg-[rgba(232,98,122,0.09)] border-[rgba(232,98,122,0.15)] text-[#FFAABC]';
  return 'bg-[rgba(232,98,122,0.17)] border-[rgba(232,98,122,0.27)] text-[#E8627A]';
};

export function SectorHeatmap() {
  const { data, isLoading } = useQuery<{ sectors: SectorData[] }>({
    queryKey: ["dashboard-sectors"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/sectors");
      if (!res.ok) throw new Error("Failed to fetch sectors");
      return res.json();
    },
    refetchInterval: 120000,
  });

  const sectors = (data?.sectors || []).slice(0, 8);

  return (
    <div className="bg-navy-card border border-border-subtle rounded-[8px] shadow-sm overflow-hidden flex flex-col h-full flex-1 min-h-[300px]">
      <div className="flex items-center justify-between p-4 md:px-5 md:py-4 border-b border-border-subtle bg-black/20">
        <div className="flex items-center gap-[9px] text-[12px] font-semibold text-t1">
          <div className="w-6 h-6 rounded shrink-0 bg-navy border border-border-subtle flex items-center justify-center">
            <LayoutGrid className="w-3 h-3" />
          </div>
          Sector Heatmap
        </div>
        <Link href="/sectors" className="font-mono text-[10px] text-t3 cursor-pointer px-[7px] py-[3px] rounded transition-colors hover:text-t1 flex items-center gap-1">
          Full view <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 p-8">
          <Loader2 className="w-5 h-5 animate-spin text-t3" />
        </div>
      ) : sectors.length === 0 ? (
        <div className="flex items-center justify-center flex-1 p-8">
          <span className="font-mono text-[10px] text-t3">No sector data available</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 p-4 md:px-5 md:py-4 flex-1">
          {sectors.map((s, i) => {
            const isPositive = s.performance >= 0;
            return (
              <div 
                key={i} 
                className={`p-2.5 rounded-[3px] cursor-pointer transition-colors border hover:brightness-125 hover:border-white/40 ${colorTier(s.performance)}`}
              >
                <div className="font-mono text-[8px] uppercase tracking-[1px] text-t1/40 mb-1">{s.name}</div>
                <div className="font-mono text-[13px] font-semibold">
                  {isPositive ? '+' : ''}{s.performance.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
