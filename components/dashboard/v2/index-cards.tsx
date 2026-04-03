import { useState } from "react";
import { useIndices } from "@/hooks/use-market-data";
import { useMarketStore } from "@/hooks/use-store";
import { Activity } from "lucide-react";
import CountUp from "react-countup";

function FlatCard({ children, isActive, onClick, minHeight = 140, p = "p-3" }: { children: React.ReactNode, isActive: boolean, onClick: () => void, minHeight?: number, p?: string }) {
  return (
    <div 
      onClick={onClick} 
      className={`relative w-full h-full overflow-hidden rounded-md cursor-pointer group flex flex-col justify-between ${p} bg-navy-card hover:bg-highlight-hov transition-colors ${isActive ? 'border border-blue-500 shadow-sm' : 'border border-border-subtle'}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      {children}
    </div>
  );
}

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
  const niftyColor = niftyIsUp ? "#22c55e" : "#ef4444";
  const niftyActive = selectedIndex === nifty.symbol;

  return (
    <div className="flex flex-col mb-[18px]">
      {/* Market Sentiment / Insight Header */}
      <div className="mb-4 flex items-center justify-between bg-navy-card border border-border-subtle rounded-md px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full`} style={{ background: niftyColor }} />
          <div className="text-xs font-medium text-t2">
            Market Insight: <span className={`${niftyIsUp ? 'text-gain' : 'text-loss'} font-bold ml-1`}>
              {niftyIsUp ? 'Bullish' : 'Bearish'}
            </span>
            <span className="hidden sm:inline text-t3 ml-2">
              — {niftyIsUp ? 'Top indices trending upwards.' : 'Top indices seeing a downturn.'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3.5 h-full">
        
        {/* DOMINANT NIFTY 50 CARD */}
        <div className="w-full lg:w-[32%] h-full">
          <FlatCard isActive={niftyActive} onClick={() => setSelectedIndex(nifty.symbol)} p="p-4" minHeight={120}>
            <div className="relative z-10 flex flex-col h-full justify-between gap-2 pointer-events-none">
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-xs font-bold flex items-center gap-2 mb-1 uppercase tracking-wider ${niftyActive ? 'text-blue-400' : 'text-t2'}`}>
                    {nifty.name.replace('Index', '').trim()}
                    <div className="flex items-center gap-1 bg-black/20 border border-border-subtle px-1.5 py-0.5 rounded text-[9px]">
                      <Activity size={10} className={niftyIsUp ? "text-gain" : "text-loss"} />
                      <span>Live</span>
                    </div>
                  </div>
                  <div className={`font-mono font-bold text-2xl tracking-tight leading-none text-t1 mt-1`}>
                    <CountUp end={nifty.price} decimals={1} duration={0.6} separator="," />
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-2">
                <div>
                  <div className={`text-sm font-bold font-mono tracking-tight ${niftyIsUp ? 'text-gain' : 'text-loss'}`}>
                    {niftyIsUp ? '▲' : '▼'} {Math.abs(nifty.change).toFixed(1)} ({nifty.changePercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="opacity-90 mt-1">
                  <Sparkline data={nifty.sparkline} color={niftyColor} width={80} height={24} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </FlatCard>
        </div>

        {/* OTHER INDICES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full lg:w-[68%]">
          {others.map((d: any) => {
            const isActive = selectedIndex === d.symbol;
            const isUp = d.changePercent >= 0;
            const color = isUp ? "#22c55e" : "#ef4444";
            
            return (
              <FlatCard key={d.symbol} isActive={isActive} onClick={() => setSelectedIndex(d.symbol)} minHeight={120} p="p-4">
                <div className="relative z-10 flex flex-col gap-1 pointer-events-none">
                  <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${isActive ? 'text-blue-400' : 'text-t2'}`}>
                    {d.name.replace('Index', '').trim()}
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  </div>
                  
                  <div className={`font-mono font-bold text-xl tracking-tight leading-none mt-1 text-t1`}>
                    <CountUp end={d.price} decimals={1} duration={0.6} separator="," />
                  </div>
                </div>

                <div className="flex items-end justify-between relative z-10 mt-3 pointer-events-none">
                  <span className={`text-[12px] font-mono font-bold tracking-tight ${isUp ? 'text-gain' : 'text-loss'}`}>
                    {isUp ? '+' : ''}{d.changePercent.toFixed(2)}%
                  </span>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={d.sparkline} color={color} width={50} height={20} strokeWidth={1.5} />
                  </div>
                </div>
              </FlatCard>
            )
          })}
        </div>
      </div>
    </div>
  );
}

