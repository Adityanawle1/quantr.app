"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Types ──────────────────────────────────────────────────
interface StatementRow {
  period: string;
  [key: string]: string | number | null;
}

interface FinancialTableProps {
  title: string;
  subtitle: string;
  rows: {
    label: string;
    key: string;
    unit?: string;
    highlight?: boolean;
    isEps?: boolean;
  }[];
  data: StatementRow[];
  unit?: string;
}

// ── Helpers ────────────────────────────────────────────────
function formatVal(
  val: number | string | null | undefined,
  isEps?: boolean
): string {
  if (val == null || val === "") return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "—";
  if (n === 0) return "—"; // 0 from Yahoo Finance usually means "not reported", show dash
  if (isEps) return n.toFixed(2);
  // already in Crores from API
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function cellColor(val: number | string | null | undefined, key: string): string {
  // For net profit, highlight green/red
  if (key !== "netProfit" && key !== "operatingProfit") return "";
  const n = typeof val === "string" ? parseFloat(val as string) : (val as number);
  if (n == null || isNaN(n)) return "";
  return n > 0 ? "text-gain" : "text-loss";
}

// ── Financial Table ────────────────────────────────────────
export function FinancialTable({
  title,
  subtitle,
  rows,
  data,
  unit = "All Figures in Cr.",
}: FinancialTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bento-card p-8 text-center text-t3 text-sm">
        No data available for this stock.
      </div>
    );
  }

  const periods = data.map((d) => d.period);

  return (
    <div className="bento-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border-subtle">
        <div>
          <h4 className="text-base font-bold text-t1 font-jakarta">{title}</h4>
          <p className="text-xs text-t3 mt-0.5">{unit}</p>
        </div>
        <span className="text-[10px] text-t3 font-mono bg-highlight border border-border-subtle px-2 py-1 rounded-md uppercase tracking-widest">
          {subtitle}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-blue uppercase tracking-widest w-44">
                Particulars
              </th>
              {periods.map((p) => (
                <th
                  key={p}
                  className="text-right px-4 py-3 text-[10px] font-bold text-blue uppercase tracking-widest whitespace-nowrap"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.key}
                className={`border-b border-border-subtle/50 transition-colors hover:bg-highlight/50 ${
                  row.highlight
                    ? "bg-blue/5 border-l-2 border-l-blue/30"
                    : ri % 2 === 0
                    ? "bg-transparent"
                    : "bg-highlight/20"
                }`}
              >
                <td
                  className={`px-5 py-2.5 text-xs font-medium whitespace-nowrap ${
                    row.highlight ? "text-t1 font-semibold" : "text-t2"
                  }`}
                >
                  {row.label}
                </td>
                {data.map((d) => {
                  const val = d[row.key];
                  const color = row.highlight ? cellColor(val, row.key) : "";
                  return (
                    <td
                      key={d.period}
                      className={`px-4 py-2.5 text-right text-xs font-mono whitespace-nowrap ${
                        row.highlight
                          ? `font-bold ${color || "text-t1"}`
                          : "text-t2"
                      }`}
                    >
                      {formatVal(val, row.isEps)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
