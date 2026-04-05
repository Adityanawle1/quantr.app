"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from "lightweight-charts";
import { useMarketStore } from "@/hooks/use-store";
import { useIndices } from "@/hooks/use-market-data";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface MarketChartProps {
  data?: any[];
  symbol?: string;
  name?: string;
}

export function MarketChart({ data, symbol, name }: MarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [activePeriod, setActivePeriod] = useState("1d");
  
  const { selectedIndex } = useMarketStore();
  const { data: indices } = useIndices();
  
  const isGlobal = !data;
  const activeIndex = isGlobal && indices ? (indices.find(i => i.symbol === selectedIndex) || indices[0]) : null;

  // Map index symbols to Yahoo Finance symbols for chart data
  const chartSymbolMap: Record<string, string> = {
    '^NSEI': '^NSEI',
    '^BSESN': '^BSESN',
    '^NSEBANK': '^NSEBANK',
    'NIFTY_MID_100.NS': 'NIFTY_MID_100',
  };

  const chartSymbol = isGlobal && activeIndex ? (chartSymbolMap[activeIndex.symbol] || activeIndex.symbol) : null;

  // Fetch real chart data for the selected index
  const { data: indexChartData, isLoading: isChartLoading } = useQuery({
    queryKey: ["index-chart", chartSymbol, activePeriod],
    queryFn: async () => {
      if (!chartSymbol) return [];
      const res = await fetch(`/api/stocks/${encodeURIComponent(chartSymbol)}/chart?period=${activePeriod}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isGlobal && !!chartSymbol,
    refetchInterval: activePeriod === '1d' ? 60000 : false, // Refresh 1D chart every minute
  });

  const chartData = data || indexChartData || [];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6A85A3",
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.02)" },
        horzLines: { color: "rgba(255,255,255,0.02)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 380,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.2)", labelBackgroundColor: "#182033" },
        horzLine: { color: "rgba(255,255,255,0.2)", labelBackgroundColor: "#182033" },
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current);
      } catch (e) {
        // Series might already be removed
      }
      seriesRef.current = null;
    }

    const isPositive = chartData.length > 1
      ? (chartData[chartData.length - 1]?.close >= chartData[0]?.close)
      : (activeIndex?.changePercent || 0) >= 0;

    const series = chartRef.current.addSeries(AreaSeries, {
      lineColor: isPositive ? "#0d9488" : "#E8627A", // Emulating gradient with Teal (#0d9488) line
      topColor: isPositive ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)", // Green/Red area fill 
      bottomColor: "rgba(34, 197, 94, 0)",
      lineWidth: 2,
    });

    seriesRef.current = series as any;

    const validData = chartData
      .filter((d: any) => (d.close !== undefined && d.close !== null) || (d.value !== undefined && d.value !== null))
      .map((d: any) => ({
        ...d,
        time: d.time,
        value: d.close !== undefined ? d.close : d.value,
      }));

    if (validData.length > 0) {
      series.setData(validData);
      chartRef.current.timeScale().fitContent();
    }
  }, [chartData, activeIndex, activePeriod]);

  return (
    <div className={`overflow-hidden flex flex-col h-full ${isGlobal ? 'bg-navy-card border border-border-subtle rounded-lg min-h-[460px]' : ''}`}>
      {isGlobal && activeIndex && (
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[12px] font-medium text-t2">{activeIndex.name?.replace('Index','').trim() || 'Market Index'}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[20px] font-bold text-t1 leading-none">{activeIndex.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
                <span className={`font-mono text-[12px] font-semibold ${activeIndex.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {activeIndex.changePercent >= 0 ? '+' : ''}{activeIndex.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {['1d', '1w', '1m', '1y'].map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors ${
                  activePeriod === p
                    ? 'bg-navy-surf text-t1 border border-border-strong'
                    : 'text-t3 hover:text-t2'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 w-full relative">
        {isGlobal && isChartLoading && chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-4 h-4 animate-spin text-t3" />
          </div>
        )}
        {isGlobal && !isChartLoading && chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-[11px] text-t3 mb-2">No data for this period</div>
              <button onClick={() => setActivePeriod('1w')} className="text-[10px] text-blue-400 hover:underline">
                Try 1W
              </button>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
