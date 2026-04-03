'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const HOLDING_DATA = [
  { name: 'Promoters', value: 50.31, color: '#00e87b' },
  { name: 'FII', value: 24.52, color: '#3b82f6' },
  { name: 'DII', value: 15.63, color: '#f59e0b' },
  { name: 'Public', value: 9.15, color: '#8b5cf6' },
  { name: 'Others', value: 0.39, color: '#64748b' },
]

const PLEDGE_HISTORY = [
  { quarter: 'Dec 2023', promoter: '50.31%', pledged: '0.00%' },
  { quarter: 'Sep 2023', promoter: '50.39%', pledged: '0.00%' },
  { quarter: 'Jun 2023', promoter: '50.39%', pledged: '0.50%' },
  { quarter: 'Mar 2023', promoter: '50.41%', pledged: '1.20%' },
  { quarter: 'Dec 2022', promoter: '50.41%', pledged: '1.20%' },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="text-zinc-300 font-medium">{`${payload[0].name} : ${payload[0].value}%`}</p>
      </div>
    )
  }
  return null
}

export function ShareholdingPattern({ promoterHolding }: { promoterHolding?: number }) {
  const chartData = [
    { name: 'Promoters', value: promoterHolding || 50.31, color: '#00e87b' },
    { name: 'FII', value: 24.52, color: '#3b82f6' },
    { name: 'DII', value: 15.63, color: '#f59e0b' },
    { name: 'Public', value: 9.15, color: '#8b5cf6' },
    { name: 'Others', value: 0.39, color: '#64748b' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {/* Target Left Column: Pie Chart */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col">
        <h3 className="text-sm font-semibold text-zinc-100 mb-6 uppercase tracking-wider">Holding Breakdown</h3>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {HOLDING_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Target Right Column: Promoter Pledging Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Promoter & Pledging History</h3>
          <p className="text-xs text-zinc-500 mt-1">Percentage of promoter shares pledged over the last 5 quarters.</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="text-zinc-400">Quarter</TableHead>
              <TableHead className="text-zinc-400">Promoter %</TableHead>
              <TableHead className="text-right text-zinc-400">Pledged %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PLEDGE_HISTORY.map((row) => (
              <TableRow key={row.quarter} className="border-zinc-800 hover:bg-zinc-900/50">
                <TableCell className="font-medium text-zinc-300">{row.quarter}</TableCell>
                <TableCell className="text-zinc-400">{row.promoter}</TableCell>
                <TableCell className="text-right text-zinc-400">{row.pledged}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
