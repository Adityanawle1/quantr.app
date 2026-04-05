"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface SectorData {
  name: string;
  performance: number;
}

const SECTOR_NAMES: Record<string, string> = {
  "UNKNOWN": "Mixed",
  "FINANCIAL_SERVICES": "Financials",
  "INFORMATION_TECHNOLOGY": "IT",
  "CONSUMER_DISCRETIONARY": "Consumer",
  "FAST_MOVING_CONSUMER_GOODS": "FMCG",
  "HEALTHCARE": "Healthcare",
  "ENERGY": "Energy",
  "INDUSTRIALS": "Industrials",
  "MATERIALS": "Materials",
  "COMMUNICATION_SERVICES": "Telecom",
  "UTILITIES": "Utilities",
  "REAL_ESTATE": "Real Estate"
};

function sectorName(s: string) {
  return SECTOR_NAMES[s] || s.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
}

function perfColor(p: number): { bg: string; text: string } {
  if (p >= 1.5) return { bg: 'rgba(34,197,94,0.18)', text: '#4ade80' };
  if (p >= 0.3) return { bg: 'rgba(34,197,94,0.08)', text: '#22c55e' };
  if (p >= -0.3) return { bg: 'transparent', text: 'var(--text-muted)' };
  if (p >= -1.5) return { bg: 'rgba(239,68,68,0.08)', text: '#ef4444' };
  return { bg: 'rgba(239,68,68,0.18)', text: '#f87171' };
}

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
    <div className="bg-navy-card border border-border-subtle rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
        <span className="text-[12px] font-semibold text-t1">Sectors</span>
        <Link href="/sectors" className="text-[10px] text-t3 hover:text-t2 transition-colors font-mono">
          All →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-px bg-border-subtle">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-navy-card p-3 animate-pulse">
              <div className="h-2.5 w-14 bg-navy-surf rounded mb-2" />
              <div className="h-4 w-10 bg-navy-surf rounded" />
            </div>
          ))}
        </div>
      ) : sectors.length === 0 ? (
        <div className="p-6 text-center text-[11px] text-t3">No data</div>
      ) : (
        <div className="grid grid-cols-4 gap-px bg-border-subtle">
          {sectors.map((s, i) => {
            const c = perfColor(s.performance);
            const isPos = s.performance >= 0;
            return (
              <div
                key={i}
                className="flex flex-col gap-1 p-3 transition-all duration-150 hover:brightness-110 cursor-default"
                style={{ background: c.bg || 'var(--background-surface)' }}
              >
                <div className="text-[9px] font-medium text-t3 truncate uppercase tracking-wide">{sectorName(s.name)}</div>
                <div className="font-mono text-[13px] font-bold" style={{ color: c.text }}>
                  {isPos ? '+' : ''}{s.performance.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
