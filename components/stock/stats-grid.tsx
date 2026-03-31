"use client";

import { formatCompact } from "@/lib/formatters";

interface StatsGridProps {
  financials: any;
}

export function StatsGrid({ financials }: StatsGridProps) {
  if (!financials) return null;

  return (
    <div className="bento-card p-6 border-border-subtle bg-navy-card/40 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-12 gap-y-8">
        <StatItem label="Market Cap" value={formatCompactValue(financials.marketCap)} />
        <StatItem label="P/E Ratio" value={financials.pe?.toFixed(2) || "—"} />
        <StatItem label="P/B Ratio" value={financials.pb?.toFixed(2) || "—"} />
        <StatItem label="Face Value" value={financials.currentPrice ? `₹${(financials.currentPrice/100).toFixed(0)}` : "—"} /> {/* Placeholder */}
        <StatItem label="Div. Yield" value={financials.dividendYield != null ? `${financials.dividendYield.toFixed(2)}%` : "—"} />
        <StatItem label="Book Value" value={financials.bookValue != null ? `₹${financials.bookValue.toFixed(2)}` : "—"} />
        <StatItem label="ROE" value={financials.roe != null ? `${financials.roe.toFixed(2)}%` : "—"} highlight />
        <StatItem label="ROCE" value={financials.roce != null ? `${financials.roce.toFixed(2)}%` : "—"} highlight />
        <StatItem label="Debt/Equity" value={financials.debtEquity != null ? financials.debtEquity.toFixed(2) : "—"} />
        <StatItem label="EPS (TTM)" value={financials.eps != null ? `₹${financials.eps.toFixed(2)}` : "—"} />
        <StatItem label="Sales Growth" value={financials.revenueGrowthYoy != null ? `${financials.revenueGrowthYoy.toFixed(2)}%` : "—"} />
        <StatItem label="Profit Growth" value={financials.profitGrowthYoy != null ? `${financials.profitGrowthYoy.toFixed(2)}%` : "—"} />
        <StatItem label="52W High" value={`₹${financials.weekHigh52?.toLocaleString("en-IN") || "—"}`} />
        <StatItem label="52W Low" value={`₹${financials.weekLow52?.toLocaleString("en-IN") || "—"}`} />
        <StatItem label="Promoter Holding" value={financials.promoterHolding != null ? `${(financials.promoterHolding * 100).toFixed(2)}%` : "—"} />
      </div>
    </div>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col space-y-1.5 group">
      <span className="text-[13px] text-t3 font-medium uppercase tracking-wider group-hover:text-t2 transition-colors">
        {label}
      </span>
      <span className={`text-lg font-bold font-jakarta transition-all ${
        highlight ? 'text-gain' : 'text-t1'
      }`}>
        {value}
      </span>
    </div>
  );
}

function formatCompactValue(val: any): string {
  if (val == null) return "—";
  const num = typeof val === 'bigint' ? Number(val) : val;
  if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  return `₹${num.toLocaleString("en-IN")}`;
}
