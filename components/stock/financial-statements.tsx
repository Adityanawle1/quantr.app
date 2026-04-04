"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, BarChart2, BookOpen } from "lucide-react";
import { FinancialTable } from "./financial-table";

// ── Row Definitions ────────────────────────────────────────

const QUARTERLY_ROWS = [
  { label: "Net Sales", key: "netSales" },
  { label: "Total Expenditure", key: "totalExpenditure" },
  { label: "Operating Profit", key: "operatingProfit", highlight: true },
  { label: "Other Income", key: "otherIncome" },
  { label: "Interest", key: "interest" },
  { label: "Depreciation", key: "depreciation" },
  { label: "Profit Before Tax", key: "profitBeforeTax", highlight: true },
  { label: "Tax", key: "tax" },
  { label: "Profit After Tax", key: "netProfit", highlight: true },
  { label: "Adjusted EPS (Rs.)", key: "eps", isEps: true },
];

const PL_ROWS = [
  { label: "Net Sales", key: "netSales" },
  { label: "Total Expenditure", key: "totalExpenditure" },
  { label: "Operating Profit", key: "operatingProfit", highlight: true },
  { label: "Other Income", key: "otherIncome" },
  { label: "Interest", key: "interest" },
  { label: "Depreciation", key: "depreciation" },
  { label: "Profit Before Tax", key: "profitBeforeTax", highlight: true },
  { label: "Tax", key: "tax" },
  { label: "Net Profit", key: "netProfit", highlight: true },
  { label: "Adjusted EPS (Rs.)", key: "eps", isEps: true },
];

const BS_ROWS = [
  { label: "Share Capital", key: "shareCapital" },
  { label: "Total Reserves", key: "totalReserves" },
  { label: "Borrowings", key: "borrowings" },
  { label: "Current Liabilities", key: "currentLiabilities" },
  { label: "Total Liabilities", key: "totalLiabilities", highlight: true },
  { label: "Net Block (Fixed Assets)", key: "netBlock" },
  { label: "Long Term Investments", key: "investments" },
  { label: "Current Assets", key: "currentAssets" },
  { label: "Total Assets", key: "totalAssets", highlight: true },
];

// ── Tab button ─────────────────────────────────────────────

function TabBtn({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
        active
          ? "bg-blue text-white shadow-lg shadow-blue/20"
          : "text-t3 hover:text-t2 hover:bg-highlight"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────

interface FinancialStatementsProps {
  symbol: string;
}

type Tab = "quarterly" | "pl" | "bs";

export function FinancialStatements({ symbol }: FinancialStatementsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("quarterly");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["deep-fundamentals", symbol],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${symbol}/deep-fundamentals`);
      if (!res.ok) throw new Error("Failed to fetch fundamentals");
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 hours cache
    retry: 1,
  });

  // Show last 5 periods only (matches Screener.in style)
  const quarterly = (data?.quarterly || []).slice(-5);
  const profitAndLoss = (data?.profitAndLoss || []).slice(-5);
  const balanceSheet = (data?.balanceSheet || []).slice(-5);

  return (
    <div className="space-y-5">
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 p-1 bg-navy-surf/50 rounded-xl border border-border-subtle w-fit">
        <TabBtn
          label="Quarterly"
          icon={BarChart2}
          active={activeTab === "quarterly"}
          onClick={() => setActiveTab("quarterly")}
        />
        <TabBtn
          label="Profit & Loss"
          icon={TrendingUp}
          active={activeTab === "pl"}
          onClick={() => setActiveTab("pl")}
        />
        <TabBtn
          label="Balance Sheet"
          icon={BookOpen}
          active={activeTab === "bs"}
          onClick={() => setActiveTab("bs")}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bento-card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-blue opacity-60" />
          <p className="text-[10px] font-bold text-t3 uppercase tracking-widest animate-pulse">
            Loading Fundamentals…
          </p>
        </div>
      ) : isError ? (
        <div className="bento-card p-8 text-center">
          <p className="text-t3 text-sm">Unable to load financial statements for this stock.</p>
          <p className="text-t4 text-xs mt-1">Yahoo Finance may not have detailed data for this symbol.</p>
        </div>
      ) : (
        <>
          {activeTab === "quarterly" && (
            <FinancialTable
              title="Quarterly Result"
              subtitle="Latest Quarters"
              rows={QUARTERLY_ROWS}
              data={quarterly}
              unit="All Figures in Cr. · Adjusted EPS in Rs."
            />
          )}
          {activeTab === "pl" && (
            <FinancialTable
              title="Profit & Loss"
              subtitle="Annual"
              rows={PL_ROWS}
              data={profitAndLoss}
              unit="All Figures in Cr. · Adjusted EPS in Rs."
            />
          )}
          {activeTab === "bs" && (
            <>
              <FinancialTable
                title="Balance Sheet"
                subtitle="Annual"
                rows={BS_ROWS}
                data={balanceSheet}
                unit="All Figures in Crores."
              />
              {balanceSheet.length > 0 && balanceSheet.every((d: Record<string, unknown>) =>
                BS_ROWS.every((r) => d[r.key] == null)
              ) && (
                <div className="rounded-xl border border-amber/20 bg-amber/5 px-5 py-3 flex items-start gap-3">
                  <span className="text-amber text-base mt-0.5">⚠</span>
                  <p className="text-xs text-t2">
                    Balance sheet data is not available for this stock via the free data source.
                    Upgrade to a paid data plan or view filings directly on{" "}
                    <a
                      href={`https://www.nseindia.com/companies-listing/corporate-filings-financial-results?symbol=${symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue underline underline-offset-2"
                    >
                      NSE
                    </a>{" "}
                    or{" "}
                    <a
                      href="https://www.screener.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue underline underline-offset-2"
                    >
                      Screener.in
                    </a>.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Data source note */}
      <p className="text-[10px] text-t4 text-center">
        Data sourced via Yahoo Finance. Figures may differ slightly from exchange filings.
      </p>
    </div>
  );
}
