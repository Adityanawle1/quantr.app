"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioTableProps {
  holdings: any[];
}

export function PortfolioTable({ holdings }: PortfolioTableProps) {
  if (!holdings || holdings.length === 0) return (
    <div className="h-64 flex items-center justify-center text-t3 font-medium uppercase tracking-widest text-xs italic opacity-40">
        No holdings found. Start by adding a stock or uploading a CSV.
    </div>
  );

  return (
    <div className="bento-card border-border-subtle bg-navy-card/40 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Instrument</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Qty</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Avg Price</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">LTP</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Cur. Value</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Total P&L</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Net ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((h, index) => {
              const isProfit = h.totalGain >= 0;
              return (
                <TableRow key={h.id ?? `${h.symbol}-${index}`} className="border-border-subtle hover:bg-white/[0.03] transition-all duration-300">
                  <TableCell className="py-4">
                    <Link href={`/stocks/${h.symbol}`} className="flex flex-col">
                      <span className="font-bold font-jakarta text-[13px] text-t1">{h.symbol}</span>
                      <span className="text-[10px] text-t3 font-medium truncate max-w-[120px] uppercase tracking-wider">{h.sector}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-bold font-jakarta text-[13px] text-t1">
                    {h.quantity}
                  </TableCell>
                  <TableCell className="text-right font-medium text-t2 text-xs">
                    ₹{h.buyPrice.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-t1 text-xs">
                    ₹{h.currentPrice.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-bold font-jakarta text-[13px] text-t1">
                    ₹{h.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className={`text-right font-bold text-xs ${isProfit ? 'text-gain' : 'text-loss'}`}>
                    <div className="flex flex-col items-end">
                        <span>{isProfit ? '+' : ''}₹{Math.abs(h.totalGain).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                        <span className="text-[9px] opacity-60 font-medium">Day: {h.dayGain >= 0 ? '+' : ''}{h.dayGainPercent.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-black text-[11px] uppercase ${isProfit ? 'text-gain' : 'text-loss'}`}>
                    <div className="flex items-center justify-end gap-1">
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {h.totalGainPercent.toFixed(2)}%
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
