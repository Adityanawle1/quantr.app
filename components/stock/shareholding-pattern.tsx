"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShareholdingPatternProps {
  promoterHolding?: number | null;
}

// Colors matching the dark theme – emerald/teal family for a premium look
const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#6b7280"];

interface HoldingSlice {
  name: string;
  value: number;
  color: string;
}

function deriveHoldings(promoterHolding: number | null | undefined): HoldingSlice[] {
  const promoter = promoterHolding != null ? +(promoterHolding * 100).toFixed(2) : 0;
  // Distribute remaining among FII, DII, Public, Others
  const remaining = +(100 - promoter).toFixed(2);

  // Reasonable distribution based on typical Indian stocks
  const fii = +(remaining * 0.38).toFixed(2);
  const dii = +(remaining * 0.35).toFixed(2);
  const pub = +(remaining * 0.22).toFixed(2);
  const others = +(remaining - fii - dii - pub).toFixed(2);

  return [
    { name: "Promoters", value: promoter, color: COLORS[0] },
    { name: "FII", value: fii, color: COLORS[1] },
    { name: "DII", value: dii, color: COLORS[2] },
    { name: "Public", value: pub, color: COLORS[3] },
    { name: "Others", value: others, color: COLORS[4] },
  ].filter((s) => s.value > 0);
}

// Generate mock pledging data
function generatePledgingData() {
  const quarters = ["Dec 2025", "Sep 2025", "Jun 2025", "Mar 2025", "Dec 2024", "Sep 2024"];
  return quarters.map((date) => ({
    date,
    promoterPct: +(Math.random() * 5 + 50).toFixed(2),
    pledgePct: +(Math.random() * 2).toFixed(2),
  }));
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-sm font-medium text-t1">{payload[0].name}</p>
        <p className="text-sm tabular-nums text-t2">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export function ShareholdingPattern({ promoterHolding }: ShareholdingPatternProps) {
  const holdings = deriveHoldings(promoterHolding);
  const pledgingData = generatePledgingData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Pie Chart */}
      <div className="bento-card p-6 flex flex-col items-center">
        <h3 className="text-xl font-semibold text-t1 mb-6 self-start">
          Shareholding Pattern
        </h3>

        <div className="w-full h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={holdings}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={800}
              >
                {holdings.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-2xl font-bold text-t1">
                {holdings.find((h) => h.name === "Promoters")?.value || 0}%
              </span>
              <br />
              <span className="text-xs text-t3 uppercase tracking-wider">Promoters</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {holdings.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-t2">
                {entry.name} : <span className="text-t1 font-medium">{entry.value}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Promoter Pledging Table */}
      <div className="bento-card p-6">
        <h3 className="text-xl font-semibold text-t1 mb-6">
          Promoter Pledging %
        </h3>

        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-highlight">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="text-right font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                  Promoter %
                </TableHead>
                <TableHead className="text-right font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                  Pledge %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pledgingData.map((row, i) => (
                <TableRow
                  key={row.date}
                  className={`border-border-subtle transition-colors ${
                    i % 2 === 0 ? "bg-highlight" : "bg-transparent"
                  } hover:bg-highlight-hov`}
                >
                  <TableCell className="text-sm text-t2 font-medium">
                    {row.date}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-t2">
                    {row.promoterPct}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-t2">
                    {row.pledgePct}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
