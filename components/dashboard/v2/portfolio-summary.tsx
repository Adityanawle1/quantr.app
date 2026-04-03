"use client";

import { BriefcaseBusiness, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import CountUp from "react-countup";

const HOLDINGS = [
  {s:'RELIANCE', qty:'120 shs',val:'₹3,52,140',ret:'+18.4%',g:1,clr:'#5B9CF6'},
  {s:'TCS',      qty:'80 shs', val:'₹3,04,960',ret:'+12.1%',g:1,clr:'#3DD68C'},
  {s:'BAJFIN',   qty:'35 shs', val:'₹2,49,368',ret:'+31.2%',g:1,clr:'#F59E0B'},
  {s:'HCLTECH',  qty:'100 shs',val:'₹1,61,250',ret:'+8.6%', g:1,clr:'#22D3EE'},
  {s:'AXISBANK', qty:'180 shs',val:'₹1,92,150',ret:'+6.3%', g:1,clr:'#A78BFA'},
  {s:'NESTLEIND',qty:'60 shs', val:'₹1,33,080',ret:'−2.1%', g:0,clr:'#E8627A'},
];

export function PortfolioSummary() {
  const wd = [42000, -8000, 28000, 32610, 0, 0, 0];
  const mx = Math.max(...wd.map(Math.abs));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-navy-card border border-border-subtle rounded-md">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:px-5 md:py-4 border-b border-border-subtle">
        <div className="flex items-center gap-[9px] text-[12px] font-semibold text-t1">
          <div className="w-6 h-6 rounded-md bg-bluedm text-blue flex items-center justify-center">
            <BriefcaseBusiness className="w-3 h-3" />
          </div>
          My Portfolio
          <span className="font-mono text-[8px] text-amber bg-ambrdk px-1.5 py-0.5 rounded border border-[rgba(245,158,11,0.18)]">DEMO</span>
        </div>
        <Link href="/portfolio" className="font-mono text-[10px] text-blue cursor-pointer px-[7px] py-[3px] rounded-[4px] transition-colors hover:bg-bluedm flex items-center gap-1">
          Details <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* Main Stats */}
      <div className="p-5 border-b border-border-subtle relative">
        <div className="font-sans text-[11px] font-bold text-t2 mb-1.5 uppercase tracking-wide">Total Value</div>
        <div className="font-sans font-bold text-3xl tracking-tight leading-none text-blue-500 mb-1">
          ₹<CountUp end={1482340} duration={0.6} separator="," />
        </div>
        <div className="text-[12px] font-medium text-gain mt-1">
          ▲ +₹<CountUp end={32610} duration={0.6} separator="," /> today &nbsp;·&nbsp; +2.25%
        </div>
      </div>

      {/* Weekly spark bars */}
      <div className="p-4 md:px-5 md:py-4 border-b border-border-subtle">
        <div className="text-[11px] font-medium text-t2 mb-2">This week</div>
        <div className="flex items-end gap-2 h-[44px]">
          {wd.map((v, i) => {
            const h = Math.max(4, Math.round((Math.abs(v) / mx) * 42));
            const bg = v === 0 ? 'rgba(255,255,255,0.07)' : v > 0 ? '#22c55e' : '#ef4444';
            return (
              <div 
                key={i}
                className="flex-1 rounded-t-[3px] transition-opacity cursor-pointer hover:opacity-100" 
                style={{ height: h, background: bg, opacity: v === 0 ? 1 : 0.75 }} 
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-t3 font-medium">Mon</span>
          <span className="text-[10px] text-t3 font-medium">Tue</span>
          <span className="text-[10px] text-t3 font-medium">Wed</span>
          <span className="text-[10px] text-t3 font-medium">Thu</span>
          <span className="text-[10px] text-t3 font-medium">Fri</span>
          <span className="text-[10px] text-t3/50">—</span>
          <span className="text-[10px] text-t3/50">—</span>
        </div>
      </div>

      {/* Holdings List */}
      <div className="overflow-y-auto max-h-[200px] flex-1 no-scrollbar">
        {HOLDINGS.map((h, i) => (
          <div key={i} className="flex items-center gap-2.5 px-5 py-[11px] border-b border-border-subtle cursor-pointer transition-colors hover:bg-highlight last:border-b-0">
            <div className="w-[3px] h-[28px] rounded-[2px] shrink-0" style={{ background: h.clr }} />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[12px] font-semibold text-t1">{h.s}</div>
              <div className="text-[10px] text-t3 mt-0.5">{h.qty}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[12px] font-medium text-t1">{h.val}</div>
              <div className={`font-mono text-[11px] font-semibold mt-0.5 ${h.g ? 'text-gain' : 'text-loss'}`}>{h.ret}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-border-strong border-t border-border-subtle mt-auto">
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Invested</div>
          <div className="text-[13px] font-mono font-bold text-t1">₹12,40,000</div>
        </div>
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Unrealised P&L</div>
          <div className="text-[13px] font-mono font-bold text-gain">+₹2,42,340</div>
        </div>
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">XIRR</div>
          <div className="text-[13px] font-mono font-bold text-gain">19.5%</div>
        </div>
        <div className="bg-navy p-3 text-center">
          <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Day P&L</div>
          <div className="text-[13px] font-mono font-bold text-gain">+₹32,610</div>
        </div>
      </div>
    </div>
  );
}
