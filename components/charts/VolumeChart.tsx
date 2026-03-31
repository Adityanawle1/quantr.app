'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'
import { Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function VolumeChart({ symbol }: { symbol: string }) {
  const { data, isLoading } = useSWR(`/api/stocks/${symbol}/chart?period=1y`, fetcher)
  
  // Ensure data exists and map to correct format
  const volumeData = data && Array.isArray(data) ? data.map((d: any) => ({
    date: new Date(d.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: d.value || d.volume || 0
  })) : []

  return (
    <div className="bg-navy-card/50 rounded-2xl border border-border-subtle p-4 flex flex-col h-[280px]">
      <h3 className="text-xl font-bold text-t1 font-jakarta mb-4">Volume History (1Y)</h3>
      
      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-lime opacity-50" />
          </div>
        ) : volumeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6A85A3' }} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis 
                 tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                 tick={{ fontSize: 10, fill: '#6A85A3' }} 
                 tickLine={false} 
                 axisLine={false} 
                 width={40}
              />
              <Tooltip
                 contentStyle={{ background: '#131B28', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12 }}
                 labelStyle={{ color: '#6A85A3', marginBottom: 4 }}
                 itemStyle={{ color: '#3FD68C', fontWeight: 'bold' }}
                 formatter={(val: any) => [Number(val).toLocaleString('en-IN'), 'Volume']}
              />
              <Bar dataKey="volume" fill="rgba(63, 214, 140, 0.4)" activeBar={{ fill: 'rgba(63, 214, 140, 0.8)' }} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-t3 text-sm">
            No volume data available
          </div>
        )}
      </div>
    </div>
  )
}
