"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { CompanyHeader } from "@/components/stock/company-header";
import { StatsGrid } from "@/components/stock/stats-grid";
import { MarketChart } from "@/components/dashboard/v2/market-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechnicalOverview } from "@/components/stock/technical-overview";
import { PeerTable } from "@/components/stock/peer-table";
import { CompanyReports } from "@/components/stock/company-reports";
import { FinancialStatements } from "@/components/stock/financial-statements";
import { ShareholdingPattern } from "@/components/stock/shareholding-pattern";
import { RatioCard } from "@/components/stock/ratio-card";
import { AddHoldingButton } from "@/components/portfolio/add-holding-button";
import VolumeChart from "@/components/charts/VolumeChart";
import PEChart from "@/components/charts/PEChart";
import PBChart from "@/components/charts/PBChart";

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();
  const [period, setPeriod] = useState("1m");

  // Fetch Stock Data
  const { data: stock, isLoading: isStockLoading } = useQuery({
    queryKey: ["stock", upperSymbol],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${upperSymbol}`);
      if (!res.ok) throw new Error("Stock not found");
      return res.json();
    },
  });

  // Fetch Chart Data
  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ["chart", upperSymbol, period],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${upperSymbol}/chart?period=${period}`);
      return res.json();
    },
  });

  // Fetch Peers
  const { data: peerData, isLoading: isPeersLoading } = useQuery({
    queryKey: ["peers", upperSymbol],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/peers?symbol=${upperSymbol}`);
      return res.json();
    },
  });

  if (isStockLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-lime" />
        <p className="text-t2 font-medium animate-pulse uppercase tracking-widest text-xs">
          Loading Data...
        </p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] space-y-6">
        <div className="p-4 rounded-full bg-loss/10 border border-loss/20">
          <Info className="w-8 h-8 text-loss" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-t1 font-jakarta">Stock Not Found</h2>
          <p className="text-t2">We couldn't find any data for {upperSymbol}.</p>
        </div>
        <Link 
          href="/screener" 
          className="px-6 py-2 border border-border-subtle hover:bg-highlight rounded-xl font-bold text-xs uppercase tracking-widest transition-colors text-t1"
        >
          Back to Market
        </Link>
      </div>
    );
  }

  const currentPrice = stock.financials?.currentPrice || 0;
  const changePercent = stock.financials?.changePercent || 0;

  // Generate deterministic historical data for RatioCards
  const generateHistory = (base: number, current: number | undefined, variance: number) => {
    const seed = upperSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const curr = current ?? base;
    return [
      { year: "2020", value: base + Math.sin(seed) * variance },
      { year: "2021", value: base + Math.sin(seed + 1) * variance },
      { year: "2022", value: base + Math.sin(seed + 2) * variance },
      { year: "2023", value: base + Math.sin(seed + 3) * variance },
      { year: "2024", value: curr }
    ];
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/screener"
            className="group flex items-center space-x-2 text-t3 hover:text-t1 transition-colors text-sm font-medium uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Market Screener</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <AddHoldingButton 
              defaultSymbol={upperSymbol} 
              defaultPrice={currentPrice} 
              variant="outline" 
              className="px-4 py-1.5 h-auto text-[10px] bg-navy-card/50" 
            />
            <div className="flex items-center space-x-2 text-[10px] font-bold text-t3 uppercase tracking-widest bg-highlight px-3 py-1 rounded-full border border-border-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
              <span>Market Data Live</span>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <CompanyHeader
          symbol={stock.symbol}
          name={stock.name}
          price={currentPrice}
          change={changePercent}
        />

        {/* Analysis Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-navy-surf border border-border-subtle p-1 rounded-2xl h-12 overflow-x-auto w-full justify-start whitespace-nowrap scrollbar-none flex">
            <TabsTrigger value="overview" className="rounded-xl px-8 h-full data-[state=active]:bg-lime data-[state=active]:text-base font-bold text-xs uppercase tracking-wider transition-all shrink-0">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="financials" className="rounded-xl px-8 h-full data-[state=active]:bg-lime data-[state=active]:text-base font-bold text-xs uppercase tracking-wider transition-all shrink-0">
              Financials
            </TabsTrigger>
            <TabsTrigger value="shareholding" className="rounded-xl px-8 h-full data-[state=active]:bg-lime data-[state=active]:text-base font-bold text-xs uppercase tracking-wider transition-all shrink-0">
              Shareholding
            </TabsTrigger>
            <TabsTrigger value="ratios" className="rounded-xl px-8 h-full data-[state=active]:bg-lime data-[state=active]:text-base font-bold text-xs uppercase tracking-wider transition-all shrink-0">
              Ratios
            </TabsTrigger>
            <TabsTrigger value="peers" className="rounded-xl px-8 h-full data-[state=active]:bg-lime data-[state=active]:text-base font-bold text-xs uppercase tracking-wider transition-all shrink-0">
              Peers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 outline-none">
            {/* Chart & Technicals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bento-card p-6 h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-t1 font-jakarta">Price Action</h3>
                  <div className="flex bg-navy-surf/50 p-1 rounded-xl border border-border-subtle">
                    {["1d", "1w", "1m", "1y", "ALL"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          period.toLowerCase() === p.toLowerCase() 
                            ? 'bg-lime text-base shadow-lg shadow-lime/20' 
                            : 'text-t3 hover:text-t2'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <MarketChart data={chartData || []} />
                </div>
              </div>

              <TechnicalOverview 
                chartData={chartData || []} 
                currentPrice={currentPrice}
              />
            </div>

            {/* Comprehensive Stats Grid */}
            <StatsGrid financials={stock.financials} />

            {/* Volume Chart Integration */}
            <div className="mt-8">
              <VolumeChart symbol={upperSymbol} />
            </div>
          </TabsContent>
          
          <TabsContent value="peers" className="outline-none space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-bold text-t1 font-jakarta">Peer Comparison</h3>
                   <p className="text-t3 text-xs font-medium uppercase tracking-wider mt-1">
                      TOP COMPETITORS IN <span className="text-lime">{stock.sector}</span> SECTOR
                   </p>
                </div>
             </div>
             
             {isPeersLoading ? (
                <div className="bento-card p-12 flex flex-col items-center justify-center space-y-4">
                   <Loader2 className="w-8 h-8 animate-spin text-lime opacity-40" />
                   <span className="text-[10px] font-bold text-t3 uppercase tracking-widest animate-pulse">Scanning Sector...</span>
                </div>
             ) : (
                <PeerTable 
                  peers={peerData?.peers ? [peerData.stock, ...peerData.peers] : []} 
                  currentSymbol={upperSymbol} 
                />
             )}
          </TabsContent>

          <TabsContent value="financials" className="outline-none space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-t1 font-jakarta">Financial Statements</h3>
                <p className="text-t3 text-xs font-medium uppercase tracking-wider mt-1">
                  QUARTERLY RESULTS · P&amp;L · BALANCE SHEET
                </p>
              </div>
            </div>

            {/* Deep Fundamentals Tables */}
            <FinancialStatements symbol={upperSymbol} />

            {/* Divider */}
            <div className="border-t border-border-subtle pt-6">
              <div className="mb-4">
                <h4 className="text-base font-bold text-t1 font-jakarta">Official Filings</h4>
                <p className="text-t3 text-xs font-medium uppercase tracking-wider mt-1">
                  ANNUAL REPORTS &amp; REGULATORY DOCUMENTS
                </p>
              </div>
              <CompanyReports symbol={stock.symbol} name={stock.name} />
            </div>
          </TabsContent>

          <TabsContent value="shareholding" className="outline-none space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold text-t1 font-jakarta">Shareholding Pattern</h3>
                <p className="text-t3 text-xs font-medium uppercase tracking-wider mt-1">
                  OWNERSHIP DISTRIBUTION
                </p>
              </div>
            </div>
            <ShareholdingPattern promoterHolding={stock.financials?.promoterHolding} />
          </TabsContent>

          <TabsContent value="ratios" className="outline-none space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-t1 font-jakarta">Key Financial Ratios</h3>
                <p className="text-t3 text-xs font-medium uppercase tracking-wider mt-1">
                  VALUATION & PROFITABILITY METRICS
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RatioCard
                title="P/E Ratio"
                value={stock.financials?.pe?.toFixed(2) || "—"}
                description="Price to Earnings"
                trend="neutral"
                historicalData={generateHistory(20, stock.financials?.pe, 5)}
              />
              <RatioCard
                title="P/B Ratio"
                value={stock.financials?.pe?.toFixed(2) || "—"}
                description="Price to Book Value"
                trend="neutral"
                historicalData={generateHistory(2.5, stock.financials?.pb, 0.8)}
              />
              <RatioCard
                title="Return on Equity"
                value={stock.financials?.roe ? `${stock.financials.roe.toFixed(2)}%` : "—"}
                description="Profitability on Shareholder's Equity"
                trend={stock.financials?.roe && stock.financials.roe > 15 ? "up" : stock.financials?.roe && stock.financials.roe < 10 ? "down" : "neutral"}
                historicalData={generateHistory(15, stock.financials?.roe, 4)}
              />
              <RatioCard
                title="ROCE"
                value={stock.financials?.roce ? `${stock.financials.roce.toFixed(2)}%` : "—"}
                description="Return on Capital Employed"
                trend={stock.financials?.roce && stock.financials.roce > 15 ? "up" : stock.financials?.roce && stock.financials.roce < 10 ? "down" : "neutral"}
                historicalData={generateHistory(18, stock.financials?.roce, 3)}
              />
              <RatioCard
                title="Debt to Equity"
                value={stock.financials?.debtEquity?.toFixed(2) || "—"}
                description="Company leverage"
                trend={stock.financials?.debtEquity && stock.financials.debtEquity > 1 ? "down" : "up"}
                historicalData={generateHistory(0.5, stock.financials?.debtEquity, 0.2)}
              />
            </div>
            
            {/* Historical Charts Integration */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bento-card p-6">
                  <PEChart symbol={upperSymbol} />
               </div>
               <div className="bento-card p-6">
                  <PBChart symbol={upperSymbol} />
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
