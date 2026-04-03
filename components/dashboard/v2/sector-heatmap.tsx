"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface SectorData {
  name: string;
  performance: number;
}

const getColors = (perf: number) => {
  if (perf >= 2) return { bg: '#10b981', t: '#ffffff' };
  if (perf >= 0.5) return { bg: 'rgba(16, 185, 129, 0.5)', t: '#e2e8f0' };
  if (perf >= -0.5) return { bg: '#1e293b', t: '#94a3b8' };
  if (perf >= -2) return { bg: 'rgba(239, 68, 68, 0.5)', t: '#e2e8f0' };
  return { bg: '#ef4444', t: '#ffffff' };
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5 p-0.5 flex-1 bg-border-subtle">
          {sectors.map((s, i) => {
            const isPositive = s.performance >= 0;
            const c = getColors(s.performance);
            return (
              <div 
                key={i} 
                className="group p-2 cursor-pointer relative"
                style={{
                  background: c.bg,
                  color: c.t
                }}
              >
                <div className="font-sans text-[10px] font-bold uppercase tracking-wider mb-0.5 pointer-events-none truncate">{s.name}</div>
                <div className="font-mono text-sm font-bold pointer-events-none">
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
