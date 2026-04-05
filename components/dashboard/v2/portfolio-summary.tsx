"use client";

import { BriefcaseBusiness, ArrowRight, LogIn, TrendingUp, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function fmt(n: number) {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const COLORS = ["#5B9CF6","#3DD68C","#F59E0B","#22D3EE","#A78BFA","#E8627A","#34D399","#FB923C"];

// ─── Guest State ───────────────────────────────────────────────────────────────
function GuestCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-navy-card border border-border-subtle rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:px-5 md:py-4 border-b border-border-subtle">
        <div className="flex items-center gap-[9px] text-[12px] font-semibold text-t1">
          <div className="w-6 h-6 rounded-md bg-bluedm text-blue flex items-center justify-center">
            <BriefcaseBusiness className="w-3 h-3" />
          </div>
          My Portfolio
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center justify-center flex-1 p-6 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-bluedm flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue" />
        </div>
        <div>
          <div className="text-[14px] font-semibold text-t1 mb-1">Track Your Portfolio</div>
          <div className="text-[11px] text-t3 leading-relaxed max-w-[180px]">
            Sign in to track your holdings, P&L, and get real-time updates
          </div>
        </div>
        <Link
          href="/auth"
          className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-md"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In to Continue
        </Link>
      </div>

      {/* Footer hint */}
      <div className="border-t border-border-subtle p-3 text-center">
        <span className="text-[10px] text-t3">
          Free · No credit card needed
        </span>
      </div>
    </div>
  );
}

// ─── Empty Portfolio State ─────────────────────────────────────────────────────
function EmptyPortfolioCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-navy-card border border-border-subtle rounded-md">
      <div className="flex items-center justify-between p-4 md:px-5 md:py-4 border-b border-border-subtle">
        <div className="flex items-center gap-[9px] text-[12px] font-semibold text-t1">
          <div className="w-6 h-6 rounded-md bg-bluedm text-blue flex items-center justify-center">
            <BriefcaseBusiness className="w-3 h-3" />
          </div>
          My Portfolio
        </div>
        <Link href="/portfolio" className="font-mono text-[10px] text-blue px-[7px] py-[3px] rounded-[4px] transition-colors hover:bg-bluedm flex items-center gap-1">
          Open <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 p-6 gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-[13px] font-medium text-t1">No holdings yet</div>
        <div className="text-[11px] text-t3 max-w-[160px] leading-relaxed">
          Add your first stock to start tracking your portfolio
        </div>
        <Link
          href="/portfolio"
          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 border border-blue-500/30 hover:bg-bluedm transition-colors px-3 py-1.5 rounded-md"
        >
          <Plus className="w-3 h-3" /> Add Holding
        </Link>
      </div>
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-navy-card border border-border-subtle rounded-md animate-pulse">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="h-4 w-28 bg-white/5 rounded" />
        <div className="h-3 w-14 bg-white/5 rounded" />
      </div>
      <div className="p-5 border-b border-border-subtle space-y-2">
        <div className="h-3 w-20 bg-white/5 rounded" />
        <div className="h-8 w-36 bg-white/5 rounded" />
        <div className="h-3 w-24 bg-white/5 rounded" />
      </div>
      <div className="flex-1 p-4 space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1 h-7 bg-white/5 rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-16 bg-white/5 rounded" />
              <div className="h-2 w-10 bg-white/5 rounded" />
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-2 w-12 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Real Portfolio ────────────────────────────────────────────────────────────
function PortfolioCard({ data }: { data: any }) {
  const { summary, holdings } = data;
  const isGain = summary.totalGain >= 0;
  const isDayGain = summary.dayGain >= 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-navy-card border border-border-subtle rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:px-5 md:py-4 border-b border-border-subtle">
        <div className="flex items-center gap-[9px] text-[12px] font-semibold text-t1">
          <div className="w-6 h-6 rounded-md bg-bluedm text-blue flex items-center justify-center">
            <BriefcaseBusiness className="w-3 h-3" />
          </div>
          My Portfolio
          <span className="font-mono text-[8px] text-gain bg-gain/10 px-1.5 py-0.5 rounded border border-gain/20">LIVE</span>
        </div>
        <Link href="/portfolio" className="font-mono text-[10px] text-blue cursor-pointer px-[7px] py-[3px] rounded-[4px] transition-colors hover:bg-bluedm flex items-center gap-1">
          Details <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* Main Stats */}
      <div className="p-5 border-b border-border-subtle">
        <div className="font-sans text-[11px] font-bold text-t2 mb-1.5 uppercase tracking-wide">Current Value</div>
        <div className="font-sans font-bold text-3xl tracking-tight leading-none text-blue-400 mb-1">
          {fmt(summary.currentTotalValue)}
        </div>
        <div className={`text-[12px] font-medium mt-1 flex items-center gap-2 ${isDayGain ? 'text-gain' : 'text-loss'}`}>
          <span>{isDayGain ? '▲' : '▼'} {fmt(Math.abs(summary.dayGain))} today</span>
          <span className="text-t3">·</span>
          <span>{isDayGain ? '+' : ''}{summary.dayGainPercent?.toFixed(2)}%</span>
        </div>
      </div>

      {/* Holdings List */}
      <div className="overflow-y-auto flex-1 no-scrollbar">
        {holdings.slice(0, 6).map((h: any, i: number) => (
          <Link
            key={h.symbol}
            href={`/stock/${h.symbol}`}
            className="flex items-center gap-2.5 px-5 py-[11px] border-b border-border-subtle cursor-pointer transition-colors hover:bg-highlight last:border-b-0 group"
          >
            <div className="w-[3px] h-[28px] rounded-[2px] shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[12px] font-semibold text-t1 group-hover:text-blue-400 transition-colors">{h.symbol}</div>
              <div className="text-[10px] text-t3 mt-0.5">{h.quantity} shs</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[12px] font-medium text-t1">{fmt(h.currentValue)}</div>
              <div className={`font-mono text-[11px] font-semibold mt-0.5 ${h.totalGain >= 0 ? 'text-gain' : 'text-loss'}`}>
                {h.totalGain >= 0 ? '+' : ''}{h.totalGainPercent?.toFixed(1)}%
              </div>
            </div>
          </Link>
        ))}
        {holdings.length > 6 && (
          <Link href="/portfolio" className="flex items-center justify-center py-2.5 text-[10px] text-blue hover:bg-highlight transition-colors">
            +{holdings.length - 6} more holdings →
          </Link>
        )}
      </div>

      {/* Footer Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-border-strong border-t border-border-subtle mt-auto">
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Invested</div>
          <div className="text-[13px] font-mono font-bold text-t1">{fmt(summary.totalInvestment)}</div>
        </div>
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Unrealised P&L</div>
          <div className={`text-[13px] font-mono font-bold ${isGain ? 'text-gain' : 'text-loss'}`}>
            {isGain ? '+' : ''}{fmt(summary.totalGain)}
          </div>
        </div>
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Holdings</div>
          <div className="text-[13px] font-mono font-bold text-t1">{holdings.length}</div>
        </div>
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Total Return</div>
          <div className={`text-[13px] font-mono font-bold ${isGain ? 'text-gain' : 'text-loss'}`}>
            {isGain ? '+' : ''}{summary.totalGainPercent?.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export function PortfolioSummary() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const { data, isLoading } = useSWR(
    isLoggedIn ? "/api/portfolio" : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Still checking auth
  if (isLoggedIn === null || (isLoggedIn && isLoading)) return <SkeletonCard />;

  // Not logged in
  if (!isLoggedIn) return <GuestCard />;

  // Logged in but no holdings
  if (!data?.holdings || data.holdings.length === 0) return <EmptyPortfolioCard />;

  // Logged in with real data
  return <PortfolioCard data={data} />;
}
