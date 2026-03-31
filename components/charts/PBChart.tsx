'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PBChart({ symbol }: { symbol: string }) {
  const { data } = useSWR(`/api/fundamentals/${symbol}/pb-history`, fetcher)
  const history = data?.history ?? []
  const avg = history.length ? history.reduce((s: number, d: any) => s + d.pb, 0) / history.length : 0

  return (
    <div className="bg-navy-card/50 rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 flex flex-col h-full w-full min-h-[300px]">
      <h3 className="text-xl font-bold text-t1 font-jakarta mb-6">P/B History</h3>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3FD68C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3FD68C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6A85A3' }} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis tick={{ fontSize: 11, fill: '#6A85A3' }} tickLine={false} axisLine={false} />
            <Tooltip
               contentStyle={{ background: '#131B28', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
               labelStyle={{ color: '#6A85A3', marginBottom: 4 }}
               itemStyle={{ color: '#3FD68C', fontWeight: 'bold' }}
               formatter={(val: any) => [Number(val).toFixed(2), 'P/B']}
            />
            <ReferenceLine y={avg} stroke="#6A85A3" strokeDasharray="4 4" label={{ position: 'insideTop', value: `Avg ${avg.toFixed(1)}x`, fill: '#6A85A3', fontSize: 11 }} />
            <Area type="monotone" dataKey="pb" stroke="#3FD68C" strokeWidth={3} fill="url(#pbGrad)" activeDot={{ r: 6, fill: '#3FD68C', stroke: '#131B28', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
