"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// Mock data generator for the sparklines
const generateData = (trend: "up" | "down") => {
  let val = trend === "up" ? 100 : 200;
  return Array.from({ length: 20 }).map((_, i) => {
    val += trend === "up" ? Math.random() * 10 - 2 : Math.random() * 10 - 8;
    return { value: val };
  });
};

const MarketIndex = ({
  name,
  value,
  change,
  percentChange,
  trend,
}: {
  name: string;
  value: string;
  change: string;
  percentChange: string;
  trend: "up" | "down";
}) => {
  const [data, setData] = useState<{ value: number }[]>([]);
  const isUp = trend === "up";

  useEffect(() => {
    setData(generateData(trend));
  }, [trend]);

  return (
    <div className="flex items-center space-x-4 pr-8 border-r border-zinc-800 last:border-0">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-t2">{name}</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-zinc-100">{value}</span>
          <span
            className={`flex items-center text-xs font-medium ${
              isUp ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {change} ({percentChange}%)
          </span>
        </div>
      </div>
      <div className="h-10 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isUp ? "#10b981" : "#f43f5e"}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export function MarketBanner() {
  return (
    <div className="w-full border-y border-zinc-800 bg-zinc-950/80 backdrop-blur-md overflow-hidden relative z-20">
      <div className="container mx-auto px-4 py-3 flex items-center overflow-x-auto no-scrollbar justify-start md:justify-center space-x-8">
        <MarketIndex
          name="NIFTY 50"
          value="22,453.30"
          change="84.20"
          percentChange="0.38"
          trend="up"
        />
        <MarketIndex
          name="SENSEX"
          value="73,982.50"
          change="120.15"
          percentChange="0.16"
          trend="up"
        />
        <MarketIndex
          name="BANKNIFTY"
          value="47,624.25"
          change="-45.10"
          percentChange="-0.09"
          trend="down"
        />
      </div>
    </div>
  );
}
