'use client'
import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import SearchBar from '@/components/search/SearchBar'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const SCREENS = [
  { id: 'all', label: 'All Market', desc: 'Browse all accessible NSE/BSE stocks', badge: 'ALL', params: {} },
  { id: 'bluechip', label: 'Bluechip Compounders', desc: 'Large caps with >15% ROE', badge: 'BC', params: { min_mcap: 50000, min_roe: 15 } },
  { id: 'value', label: 'Undervalued Gems', desc: 'P/E < 15 & High ROCE', badge: 'UG', params: { max_pe: 15, min_roce: 15 } },
  { id: 'debtfree', label: 'Debt-Free Kings', desc: 'Zero debt & highly consistent', badge: 'DK', params: { max_de: 0.1, min_roe: 10 } },
  { id: 'yield', label: 'High Yielders', desc: 'Top robust dividend paying stocks', badge: 'HY', params: { min_div: 4, min_mcap: 5000 } },
]

export default function ScreenerPage() {
  const [activeScreen, setActiveScreen] = useState('all')
  const [filterSector, setFilterSector] = useState('')
  const router = useRouter()

  const activeParams = useMemo(() => {
    const screenParams = SCREENS.find(s => s.id === activeScreen)?.params || {};
    const params = new URLSearchParams();
    Object.entries(screenParams).forEach(([k, v]) => params.append(k, String(v)));
    if (filterSector) params.append('sector', filterSector);
    return params.toString();
  }, [activeScreen, filterSector]);

  const { data, isLoading } = useSWR(`/api/screener?${activeParams}`, fetcher)
  const stocks = data?.data ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-3xl font-black font-jakarta text-t1 tracking-tight">Stock Screener</h1>
          <p className="text-[#8A9DB8] mt-1.5 font-medium">Deploy pre-built quantitative strategies or browse the market.</p>
        </div>
        <div className="w-full md:w-[400px]">
          <SearchBar className="m-0" />
        </div>
      </div>

      {/* Ready-Made Strategy Screens */}
      <div>
        <h2 className="text-[13px] font-bold tracking-widest uppercase text-t3 mb-4">Thematic Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SCREENS.map(s => {
            const isActive = activeScreen === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveScreen(s.id)}
                  className={`p-4 rounded-[12px] border cursor-pointer transition-all duration-300 group flex flex-col items-start gap-4 ${isActive ? 'bg-[rgba(212,175,95,0.06)] border-[rgba(212,175,95,0.3)] shadow-[0_0_20px_rgba(212,175,95,0.05),inset_0_2px_10px_rgba(0,0,0,0.5)] transform scale-[0.98]' : 'bg-navy-surf border-border-subtle hover:bg-highlight-hov hover:border-[rgba(212,175,95,0.15)]'}`}
                >
                  <div className={`text-[11px] font-bold px-2 py-1 rounded-[6px] bg-black/40 border transition-colors ${isActive ? 'text-[#d4af5f] border-[rgba(212,175,95,0.2)]' : 'text-t2 border-border-subtle group-hover:text-[#d4af5f]'}`}>
                    {s.badge}
                  </div>
                  <div>
                    <h3 className={`font-display text-[16px] font-bold mb-1 transition-colors ${isActive ? 'text-[#d4af5f]' : 'text-t1'}`}>{s.label}</h3>
                    <p className="text-xs text-t3 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              )
          })}
        </div>
      </div>

      {/* Tools & Table View */}
      <div className="bg-navy-card/50 rounded-[20px] border border-border-subtle overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="font-mono text-xs text-[#8A9DB8] tracking-widest">{stocks.length} EQUITIES FOUND</span>
           </div>
           
           {/* Simple Sector Filter */}
           <select 
              value={filterSector} 
              onChange={(e) => setFilterSector(e.target.value)}
              className="bg-navy-surf border border-border-subtle text-xs text-t1 rounded-lg px-3 py-1.5 outline-none focus:border-[rgba(212,175,95,0.4)] focus:ring-1 focus:ring-[rgba(212,175,95,0.2)] transition-shadow"
            >
             <option value="">All Sectors</option>
             <option value="IT">Information Technology</option>
             <option value="Financial">Financials</option>
             <option value="Energy">Energy</option>
             <option value="Auto">Automobiles</option>
             <option value="Consumer">Consumer Goods</option>
           </select>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-bold text-t3 uppercase tracking-wider border-b border-border-subtle bg-[#0B101A]/50">
                <th className="px-6 py-4 text-left">Symbol</th>
                <th className="px-6 py-4 text-left">Company Name</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Change</th>
                <th className="px-6 py-4 text-right">Market Cap</th>
                <th className="px-6 py-4 text-right">P/E</th>
                <th className="px-6 py-4 text-right">ROE</th>
                <th className="px-6 py-4 text-right">D/E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-6 py-5"><div className="h-4 bg-highlight rounded w-16" /></td>
                      ))}
                    </tr>
                  ))
                : stocks.map((s: any) => (
                    <tr
                      key={s.symbol}
                      onClick={() => router.push(`/stocks/${s.symbol}`)}
                      className="hover:bg-highlight-hov cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold font-mono text-t1 group-hover:text-[#d4af5f] transition-colors">{s.symbol}</td>
                      <td className="px-6 py-4 text-[#8A9DB8] max-w-[200px] truncate">{s.name}</td>
                      <td className="px-6 py-4 font-mono text-right text-t1">₹{s.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className={`px-6 py-4 font-mono text-right font-bold ${s.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {s.change >= 0 ? '+' : ''}{s.change?.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 font-mono text-right text-[#8A9DB8]">{s.marketCapFormatted || '-'}</td>
                      <td className="px-6 py-4 font-mono text-right text-[#8A9DB8]">{s.pe?.toFixed(1) || '-'}</td>
                      <td className="px-6 py-4 font-mono text-right text-[#8A9DB8]">{s.roe ? `${s.roe}%` : '-'}</td>
                      <td className="px-6 py-4 font-mono text-right text-[#8A9DB8]">{s.debtToEquity?.toFixed(2) || '-'}</td>
                    </tr>
                  ))}
              {!isLoading && stocks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-t3">
                    No equities found matching this screener criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
