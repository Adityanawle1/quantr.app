'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

const INDICES = [
  { name: 'SENSEX', value: '73,651.35', change: '+200.45', pChange: '0.27%', isUp: true },
  { name: 'NIFTY 50', value: '22,405.60', change: '+55.30', pChange: '0.25%', isUp: true },
  { name: 'BANKNIFTY', value: '47,327.85', change: '-120.10', pChange: '-0.25%', isUp: false },
  { name: 'NIFTY IT', value: '34,980.20', change: '+450.25', pChange: '1.30%', isUp: true },
  { name: 'NIFTY AUTO', value: '20,145.75', change: '+12.40', pChange: '0.06%', isUp: true },
  { name: 'BSE MIDCAP', value: '38,710.20', change: '-45.60', pChange: '-0.12%', isUp: false },
  { name: 'NIFTY PHARMA', value: '18,655.40', change: '+85.20', pChange: '0.46%', isUp: true },
  { name: 'NIFTY METAL', value: '8,321.15', change: '-21.30', pChange: '-0.25%', isUp: false }
]

export function MarketTicker() {
  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 overflow-hidden relative flex text-xs font-medium h-10 items-center select-none text-zinc-300">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
      <div className="flex whitespace-nowrap animate-marquee absolute left-0 flex-nowrap w-[200%] max-w-none">
        {/* We duplicate the items to make the infinite scroll seamless */}
        {[...INDICES, ...INDICES].map((idx, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-zinc-800 shrink-0">
            <span className="font-semibold text-zinc-100">{idx.name}</span>
            <span>{idx.value}</span>
            <span className={`flex items-center gap-1 ${idx.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
              {idx.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {idx.change} ({idx.pChange})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
