import { useState } from "react";
import { useIndices } from "@/hooks/use-market-data";
import { useMarketStore } from "@/hooks/use-store";
import { Activity } from "lucide-react";

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

export function IndexCards() {
  const { data: indices, isLoading } = useIndices();
  const { selectedIndex, setSelectedIndex } = useMarketStore();

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-3.5 mb-[18px]">
        <div className="w-full lg:w-[32%] h-[140px] bg-navy-card shadow-sm border border-border-subtle rounded-[10px] animate-pulse" />
        <div className="w-full lg:w-[68%] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[1,2,3].map(i => (
            <div key={i} className="h-[140px] bg-navy-card shadow-sm border border-border-subtle rounded-[10px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const items = indices || [];
  if (items.length === 0) return null;

  const nifty = items.find((d: any) => d.symbol === "^NSEI" || d.name.includes("Nifty 50")) || items[0];
  const others = items.filter((d: any) => d.symbol !== nifty.symbol).slice(0, 3);

  const niftyIsUp = nifty.changePercent >= 0;
  const niftyColor = niftyIsUp ? "#3DD68C" : "#E8627A";
  const niftyActive = selectedIndex === nifty.symbol;

  return (
    <div className="flex flex-col mb-[18px]">
      {/* Market Sentiment / Insight Header */}
      <div className="mb-4 flex items-center justify-between bg-navy-card border border-border-subtle rounded-[8px] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]`} style={{ background: niftyColor, boxShadow: `0 0 8px ${niftyColor}80` }} />
          <div className="text-[13px] font-medium text-t2">
            Market Insight: <span className={`${niftyIsUp ? 'text-[#3DD68C]' : 'text-[#E8627A]'} font-semibold ml-1`}>
              {niftyIsUp ? 'Bullish Momentum' : 'Bearish Pressure'}
            </span>
            <span className="hidden sm:inline text-t3 ml-2">
              — {niftyIsUp ? 'Top indices are trending upwards indicating market strength.' : 'Top indices are seeing a downturn, signaling caution.'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3.5">
        
        {/* DOMINANT NIFTY 50 CARD */}
        <div 
          onClick={() => setSelectedIndex(nifty.symbol)}
          className={`relative cursor-pointer transition-all duration-300 w-full lg:w-[32%] rounded-[10px] p-5 lg:p-6 shadow-sm border group flex flex-col justify-between min-h-[140px] overflow-hidden bg-navy-card
            ${niftyActive ? (niftyIsUp ? 'border-[#3DD68C] ring-1 ring-[#3DD68C]/50 bg-gradient-to-br from-card to-[#3DD68C]/5' : 'border-[#E8627A] ring-1 ring-[#E8627A]/50 bg-gradient-to-br from-card to-[#E8627A]/5') : 'border-border-subtle hover:border-black/10 dark:hover:border-white/10'}`}
        >
          {/* Signature Feature: Soft Radial Glow & Glass Feel */}
          <div 
            className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[60px] pointer-events-none transition-opacity duration-500
              ${niftyActive ? 'opacity-30' : 'opacity-[0.08] group-hover:opacity-15'}`} 
            style={{ background: niftyColor }} 
          />
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-2">
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-[13px] font-semibold flex items-center gap-2 mb-1.5 ${niftyActive ? 'text-t1' : 'text-t2'}`}>
                  {nifty.name.replace('Index', '').trim()}
                  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                    <Activity size={12} className={niftyIsUp ? "text-[#3DD68C]" : "text-[#E8627A]"} />
                    <span>Live</span>
                  </div>
                </div>
                <div className={`font-mono text-[28px] lg:text-[32px] font-bold tracking-[-1px] leading-none text-t1`}>
                  {nifty.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </div>
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className={`text-[14px] lg:text-[15px] font-semibold tracking-tight ${niftyIsUp ? 'text-[#3DD68C]' : 'text-[#E8627A]'}`}>
                  {niftyIsUp ? '▲' : '▼'} {Math.abs(nifty.change).toFixed(1)} ({nifty.changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="opacity-90 mt-1">
                <Sparkline data={nifty.sparkline} color={niftyColor} width={80} height={32} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* OTHER INDICES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full lg:w-[68%]">
          {others.map((d: any) => {
            const isActive = selectedIndex === d.symbol;
            const isUp = d.changePercent >= 0;
            const color = isUp ? "#3DD68C" : "#E8627A";
            
            return (
              <div 
                key={d.symbol}
                onClick={() => setSelectedIndex(d.symbol)}
                className={`cursor-pointer transition-all duration-300 relative overflow-hidden bg-navy-card border rounded-[10px] p-5 shadow-sm group flex flex-col justify-between min-h-[140px]
                  ${isActive ? (isUp ? 'border-[#3DD68C] ring-1 ring-[#3DD68C]/30 bg-gradient-to-b from-card to-[#3DD68C]/[0.02]' : 'border-[#E8627A] ring-1 ring-[#E8627A]/30 bg-gradient-to-b from-card to-[#E8627A]/[0.02]') : 'border-border-subtle hover:border-black/10 dark:hover:border-white/10'}`}
              >
                <div className="relative z-10 flex flex-col gap-1">
                  <div className={`text-[12px] font-semibold flex items-center justify-between ${isActive ? 'text-t1' : 'text-t2'}`}>
                    {d.name.replace('Index', '').trim()}
                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
                  </div>
                  
                  <div className={`font-mono text-[22px] font-bold tracking-[-0.8px] leading-none mt-1 text-t1`}>
                    {d.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </div>
                </div>

                <div className="flex items-end justify-between relative z-10 mt-4">
                  <span className={`text-[12px] font-semibold tracking-tight ${isUp ? 'text-[#3DD68C]' : 'text-[#E8627A]'}`}>
                    {isUp ? '+' : ''}{d.changePercent.toFixed(2)}%
                  </span>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={d.sparkline} color={color} width={64} height={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

