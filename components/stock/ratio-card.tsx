"use client";

import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface RatioCardProps {
  title: string;
  value: string;
  description?: string;
  trend: "up" | "down" | "neutral";
  historicalData: { year: string; value: number }[];
}

export function RatioCard({ title, value, description, trend, historicalData }: RatioCardProps) {
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#f43f5e" : "#3b82f6";
  const trendTextClass = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-blue-500";

  return (
    <div className="bento-card flex flex-col justify-between h-40 group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start w-full gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-t2 font-medium text-sm">{title}</h4>
            {description && (
              <Tooltip.Provider delayDuration={200}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button className="text-t3 hover:text-t2 transition-colors">
                      <Info size={14} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="max-w-xs bg-navy-card border border-[rgba(255,255,255,0.06)] rounded-xl shadow-xl px-4 py-3 text-xs text-t2 leading-relaxed z-50"
                      sideOffset={6}
                    >
                      <strong className="block mb-1 text-emerald-400">{title}</strong>
                      {description}
                      <Tooltip.Arrow className="fill-[rgba(255,255,255,0.06)]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}
          </div>
          <span className={`text-2xl font-bold tracking-tight ${trendTextClass}`}>{value}</span>
        </div>
        
        {/* 5-Year Trend Sparkline */}
        <div className="h-16 w-24 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={trendColor} 
                strokeWidth={2} 
                dot={{ r: 2, fill: trendColor }} 
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-t3 mt-4 border-t border-border-subtle pt-3">
        <span>5-Year Trend</span>
        <span className="font-semibold text-t2">Stable</span>
      </div>
    </div>
  );
}
