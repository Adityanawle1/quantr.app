import { useState } from "react";
import { useIndices } from "@/hooks/use-market-data";
import { useMarketStore } from "@/hooks/use-store";
import { Activity } from "lucide-react";
import CountUp from "react-countup";

function FlatCard({ children, isActive, onClick, minHeight = 140, p = "p-3" }: { children: React.ReactNode, isActive: boolean, onClick: () => void, minHeight?: number, p?: string }) {
  return (
    <div 
      onClick={onClick} 
      className={`relative w-full h-full overflow-hidden rounded-xl cursor-pointer group flex flex-col justify-between ${p} bg-background-primary hover:bg-accent-blue-muted transition-all duration-200 ${isActive ? 'border-2 border-primary shadow-md ring-4 ring-primary/5' : 'border border-border-subtle shadow-sm hover:border-primary/30'}`}
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
        <div className="w-full lg:w-[32%] h-[140px] bg-background-primary shadow-sm border border-border-subtle rounded-xl animate-pulse" />
        <div className="w-full lg:w-[68%] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[1,2,3].map(i => (
            <div key={i} className="h-[140px] bg-background-primary shadow-sm border border-border-subtle rounded-xl animate-pulse" />
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
  const niftyColor = niftyIsUp ? "var(--gain)" : "var(--loss)";
  const niftyActive = selectedIndex === nifty.symbol;

  return (
    <div className="flex flex-col mb-[18px]">
      {/* Market Sentiment / Insight Header */}
      <div className="mb-4 flex items-center justify-between bg-background-primary border border-border-subtle rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: niftyColor }} />
          <div className="text-[13px] font-medium text-t2">
            Market Insight: <span className={`${niftyIsUp ? 'text-gain' : 'text-loss'} font-bold ml-1`}>
              {niftyIsUp ? 'Bullish' : 'Bearish'}
            </span>
            <span className="hidden sm:inline text-t3 ml-2">
              — {niftyIsUp ? 'Top indices trending upwards today.' : 'Top indices seeing a downturn today.'}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-t4 uppercase tracking-widest bg-background-surface px-2 py-1 rounded-md border border-border-subtle">
           Updated Live
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3.5 h-full">
        
        {/* DOMINANT NIFTY 50 CARD */}
        <div className="w-full lg:w-[32%] h-full">
          <FlatCard isActive={niftyActive} onClick={() => setSelectedIndex(nifty.symbol)} p="p-5" minHeight={120}>
            <div className="relative z-10 flex flex-col h-full justify-between gap-2 pointer-events-none">
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-[11px] font-bold flex items-center gap-2 mb-1 uppercase tracking-wider ${niftyActive ? 'text-primary' : 'text-t3'}`}>
                    {nifty.name.replace('Index', '').trim()}
                    <div className="flex items-center gap-1 bg-background-surface border border-border-subtle px-1.5 py-0.5 rounded text-[9px]">
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
                  <Sparkline data={nifty.sparkline} color={niftyColor} width={80} height={24} strokeWidth={2} />
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
            const color = isUp ? "var(--gain)" : "var(--loss)";
            
            return (
              <FlatCard key={d.symbol} isActive={isActive} onClick={() => setSelectedIndex(d.symbol)} minHeight={120} p="p-5">
                <div className="relative z-10 flex flex-col gap-1 pointer-events-none">
                  <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${isActive ? 'text-primary' : 'text-t3'}`}>
                    {d.name.replace('Index', '').trim()}
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  </div>
                  
                  <div className={`font-mono font-bold text-xl tracking-tight leading-none mt-1 text-t1`}>
                    <CountUp end={d.price} decimals={1} duration={0.6} separator="," />
                  </div>
                </div>

                <div className="flex items-end justify-between relative z-10 mt-4 pointer-events-none">
                  <span className={`text-[12px] font-mono font-bold tracking-tight ${isUp ? 'text-gain' : 'text-loss'}`}>
                    {isUp ? '+' : ''}{d.changePercent.toFixed(2)}%
                  </span>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={d.sparkline} color={color} width={60} height={20} strokeWidth={2} />
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

