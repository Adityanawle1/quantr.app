"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCompact } from "@/lib/formatters";

interface PeerTableProps {
  peers: any[];
  currentSymbol: string;
}

export function PeerTable({ peers, currentSymbol }: PeerTableProps) {
  if (!peers || peers.length === 0) return (
    <div className="h-64 flex items-center justify-center text-t3 font-medium uppercase tracking-widest text-xs italic opacity-40">
        No peer data available for this segment.
    </div>
  );

  return (
    <div className="bento-card border-border-subtle bg-navy-card/40 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Company</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">Price</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">P/E</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">P/B</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">ROE (%)</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">ROCE (%)</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4 uppercase">D/E</TableHead>
              <TableHead className="text-right text-t3 font-bold text-[10px] uppercase tracking-widest py-4">M.Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {peers.map((p) => {
              const isCurrent = p.symbol === currentSymbol;
              return (
                <TableRow 
                    key={p.symbol} 
                    className={`border-border-subtle transition-all duration-300 ${
                        isCurrent 
                            ? 'bg-lime/5 border-l-2 border-l-lime' 
                            : 'hover:bg-white/[0.03]'
                    }`}
                >
                  <TableCell className="py-4">
                    <Link href={`/stocks/${p.symbol}`} className="flex flex-col">
                      <span className={`font-bold font-jakarta text-[13px] ${isCurrent ? 'text-lime' : 'text-t1'}`}>
                        {p.symbol}
                        {isCurrent && <span className="ml-2 px-1.5 py-0.5 rounded bg-lime/10 text-lime text-[8px] font-black uppercase">You</span>}
                      </span>
                      <span className="text-[10px] text-t3 font-medium truncate max-w-[120px]">{p.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-bold font-jakarta text-[13px] text-t1">
                    ₹{p.price.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-medium text-t2 text-xs">
                    {p.pe?.toFixed(1) || "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-t2 text-xs">
                    {p.pb?.toFixed(2) || "—"}
                  </TableCell>
                  <TableCell className={`text-right font-bold text-xs ${p.roe > 15 ? 'text-gain' : 'text-t2'}`}>
                    {p.roe?.toFixed(1) || "—"}%
                  </TableCell>
                  <TableCell className={`text-right font-bold text-xs ${p.roce > 15 ? 'text-gain' : 'text-t2'}`}>
                    {p.roce?.toFixed(1) || "—"}%
                  </TableCell>
                  <TableCell className={`text-right font-medium text-xs ${p.debtEquity > 1 ? 'text-loss' : 'text-t2'}`}>
                    {p.debtEquity?.toFixed(2) || "—"}
                  </TableCell>
                  <TableCell className="text-right font-bold font-jakarta text-[13px] text-t1 whitespace-nowrap">
                    {formatCompact(p.marketCap)}
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
