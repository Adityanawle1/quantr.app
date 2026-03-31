"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface SectorData {
  name: string;
  performance: number;
}

function getSectorColor(perf: number): string {
  if (perf > 2) return "bg-emerald-400";
  if (perf > 1) return "bg-emerald-500/80";
  if (perf > 0.5) return "bg-emerald-600/60";
  if (perf > 0) return "bg-emerald-700/40";
  if (perf > -1) return "bg-rose-900/40";
  if (perf > -2) return "bg-rose-700/60";
  if (perf > -3) return "bg-rose-500/80";
  return "bg-rose-400";
}

export function SectorHeatmap() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/sectors");
        const json = await res.json();
        setSectors(json.sectors || []);
      } catch {
        console.error("Failed to load sectors");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-zinc-50">Sector Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-t3 text-sm">Loading sectors...</div>
        ) : (
          <div className="grid grid-cols-3 gap-2 h-full min-h-[260px]">
            {sectors.map((sector) => (
              <div
                key={sector.name}
                className={`${getSectorColor(sector.performance)} rounded-md p-2 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 cursor-pointer overflow-hidden`}
              >
                <div className="text-xs font-semibold text-t1 drop-shadow-md truncate w-full px-1">{sector.name}</div>
                <div className="text-[10px] text-t1 opacity-90 drop-shadow-md">
                  {sector.performance > 0 ? "+" : ""}{sector.performance.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
