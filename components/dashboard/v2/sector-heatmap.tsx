"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface SectorData {
  name: string;
  performance: number;
}

const getColors = (perf: number) => {
  if (perf >= 2) return { bg: 'var(--gain)', t: '#ffffff' };
  if (perf >= 0.5) return { bg: 'var(--gaindm)', t: 'var(--gain)' };
  if (perf >= -0.5) return { bg: 'var(--background-elevated)', t: 'var(--text-muted)' };
  if (perf >= -2) return { bg: 'var(--lossdm)', t: 'var(--loss)' };
  return { bg: 'var(--loss)', t: '#ffffff' };
};

const SECTOR_DISPLAY_NAMES: Record<string, string> = {
  "UNKNOWN": "Mixed",
  "FINANCIAL_SERVICES": "Financials",
  "INFORMATION_TECHNOLOGY": "IT",
  "CONSUMER_DISCRETIONARY": "Consumer",
  "FAST_MOVING_CONSUMER_GOODS": "FMCG",
  "HEALTHCARE": "Healthcare",
  "ENERGY": "Energy",
  "INDUSTRIALS": "Industrials",
  "MATERIALS": "Materials",
  "COMMUNICATION_SERVICES": "Comm",
  "UTILITIES": "Utilities",
  "REAL_ESTATE": "Real Estate"
};

const formatSectorName = (name: string) => {
  if (SECTOR_DISPLAY_NAMES[name]) return SECTOR_DISPLAY_NAMES[name];
  return name.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
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
    <div className="bg-background-primary border border-border-subtle rounded-xl shadow-sm overflow-hidden flex flex-col h-full flex-1 min-h-[300px]">
      <div className="flex items-center justify-between p-4 md:px-5 md:py-4 border-b border-border-subtle bg-background-surface">
        <div className="flex items-center gap-[9px] text-[13px] font-bold text-t1 uppercase tracking-tight">
          <div className="w-6 h-6 rounded-lg shrink-0 bg-accent-blue-muted border border-accent-blue-border flex items-center justify-center">
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
          </div>
          Sector Overview
        </div>
        <Link href="/sectors" className="font-mono text-[10px] text-t3 cursor-pointer px-2 py-1 rounded-md bg-background-elevated transition-all hover:text-primary hover:bg-accent-blue-muted flex items-center gap-1 uppercase font-bold border border-border-subtle">
           Analytics <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 p-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : sectors.length === 0 ? (
        <div className="flex items-center justify-center flex-1 p-8">
          <span className="font-mono text-[10px] text-t3 uppercase tracking-widest">No sector data</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px flex-1 bg-border-subtle">
          {sectors.map((s, i) => {
            const isPositive = s.performance >= 0;
            const c = getColors(s.performance);
            return (
              <div 
                key={i} 
                className="group p-4 cursor-pointer relative flex flex-col justify-center transition-all duration-200 hover:brightness-105"
                style={{
                  background: c.bg,
                  color: c.t
                }}
              >
                <div className="font-sans text-[10px] font-black uppercase tracking-[0.05em] mb-1 pointer-events-none truncate opacity-80">{formatSectorName(s.name)}</div>
                <div className="font-mono text-base font-black pointer-events-none tracking-tight">
                  {isPositive ? '+' : ''}{s.performance.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
