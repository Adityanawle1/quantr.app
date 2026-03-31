"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, LineSeries } from "lightweight-charts";
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  data: { time: string | number; value: number; open: number; high: number; low: number; close: number }[];
}

export function PriceChart({ data }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<"line" | "candle">("candle");
  
  // Keep track of series to remove when toggling
  const seriesRef = useRef<ISeriesApi<"Line" | "Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa', // zinc-400
      },
      grid: {
        vertLines: { color: '#27272a' }, // zinc-800
        horzLines: { color: '#27272a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#27272a',
      },
      rightPriceScale: {
        borderColor: '#27272a',
      },
    });
    
    chartRef.current = chart;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current);
      } catch {
        // Series may already be removed (React strict mode)
      }
      seriesRef.current = null;
    }

    const validData = data.filter(d => d.close !== undefined && d.close !== null);

    if (validData.length > 0) {
      if (chartType === "candle") {
        const series = chartRef.current.addSeries(CandlestickSeries, {
          upColor: '#10b981', // emerald-500
          downColor: '#f43f5e', // rose-500
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#f43f5e',
        });
        series.setData(validData.map(d => ({ time: d.time as any, open: d.open, high: d.high, low: d.low, close: d.close })));
        seriesRef.current = series as ISeriesApi<"Candlestick">;
      } else {
        const series = chartRef.current.addSeries(LineSeries, {
          color: '#3b82f6', // blue-500
          lineWidth: 2,
        });
        series.setData(validData.map(d => ({ time: d.time as any, value: d.close })));
        seriesRef.current = series as ISeriesApi<"Line">;
      }
      
      chartRef.current.timeScale().fitContent();
    }

  }, [chartType, data]);

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex justify-end space-x-2">
        <Button 
          variant={chartType === "candle" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setChartType("candle")}
          className={chartType === "candle" ? "bg-navy-surf text-t1" : "border-zinc-800 text-t2"}
        >
          Candles
        </Button>
        <Button 
          variant={chartType === "line" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setChartType("line")}
          className={chartType === "line" ? "bg-navy-surf text-t1" : "border-zinc-800 text-t2"}
        >
          Line
        </Button>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}
