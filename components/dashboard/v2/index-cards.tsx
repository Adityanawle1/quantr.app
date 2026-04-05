import { useState } from "react";
import { useIndices } from "@/hooks/use-market-data";
import { useMarketStore } from "@/hooks/use-store";

function Sparkline({ data, color, width = 58, height = 22, strokeWidth = 1.5 }: { data: number[], color: string, width?: number, height?: number, strokeWidth?: number }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - mn) / (mx - mn || 1)) * height}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IndexCard({ d, isActive, onClick, large = false }: { d: any, isActive: boolean, onClick: () => void, large?: boolean }) {
  const isUp = d.changePercent >= 0;
  const color = isUp ? "var(--gain)" : "var(--loss)";

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg border transition-all duration-150 p-4 flex flex-col justify-between gap-3
        ${isActive
          ? 'border-blue-500/40 bg-blue-500/5'
          : 'border-border-subtle bg-navy-card hover:border-border-strong hover:bg-navy-surf'
        }
        ${large ? 'min-h-[120px]' : 'min-h-[110px]'}
      `}
    >
      {/* Name + dot */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-t3 truncate">{d.name.replace('Index', '').replace('NIFTY ', 'Nifty ').trim()}</span>
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      </div>

      {/* Price */}
      <div>
        <div className={`font-mono font-bold ${large ? 'text-[22px]' : 'text-[18px]'} text-t1 leading-none`}>
          {d.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
        </div>
        <div className={`font-mono text-[11px] font-semibold mt-1.5 ${isUp ? 'text-gain' : 'text-loss'}`}>
          {isUp ? '+' : ''}{d.changePercent.toFixed(2)}%
          <span className="text-t3 font-normal ml-1.5">
            {isUp ? '+' : ''}{d.change.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex justify-end opacity-70">
        <Sparkline data={d.sparkline} color={color} width={large ? 80 : 60} height={20} strokeWidth={1.5} />
      </div>
    </div>
  );
}

export function IndexCards() {
  const { data: indices, isLoading } = useIndices();
  const { selectedIndex, setSelectedIndex } = useMarketStore();

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="w-full lg:w-[30%] h-[120px] bg-navy-card border border-border-subtle rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-3 w-full lg:w-[70%]">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[110px] bg-navy-card border border-border-subtle rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const items = indices || [];
  if (items.length === 0) return null;

  const nifty = items.find((d: any) => d.symbol === "^NSEI" || d.name.includes("Nifty 50")) || items[0];
  const others = items.filter((d: any) => d.symbol !== nifty.symbol).slice(0, 3);

  return (
    <div className="flex flex-col lg:flex-row gap-3 mb-4">
      <div className="w-full lg:w-[30%]">
        <IndexCard d={nifty} isActive={selectedIndex === nifty.symbol} onClick={() => setSelectedIndex(nifty.symbol)} large />
      </div>
      <div className="grid grid-cols-3 gap-3 w-full lg:w-[70%]">
        {others.map((d: any) => (
          <IndexCard key={d.symbol} d={d} isActive={selectedIndex === d.symbol} onClick={() => setSelectedIndex(d.symbol)} />
        ))}
      </div>
    </div>
  );
}
