"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AllocationChartProps {
  holdings: any[];
}

const COLORS = ["#3DD68C", "#E8627A", "#FFD21E", "#3D82D6", "#9E58FF", "#FF8658", "#33DDB3", "#BDC3C7"];

export function AllocationChart({ holdings }: AllocationChartProps) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="bento-card p-6 flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <div className="w-48 h-48 rounded-full border-4 border-dashed border-border-subtle animate-pulse" />
        <p className="text-[10px] font-bold text-t3 uppercase tracking-widest italic">No allocation data</p>
      </div>
    );
  }

  // Group by sector
  const sectorDataMap = holdings.reduce((acc: any, h) => {
    const sector = h.sector || "Other";
    acc[sector] = (acc[sector] || 0) + h.currentValue;
    return acc;
  }, {});

  const data = Object.keys(sectorDataMap).map(name => ({
    name,
    value: sectorDataMap[name]
  })).sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bento-card p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-t1 font-jakarta">Sector Allocation</h3>
        <span className="text-[10px] font-bold text-t3 uppercase tracking-widest bg-highlight px-2 py-1 rounded-md border border-border-subtle">
          {data.length} Sectors
        </span>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: '#182033', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                itemStyle={{ color: '#E8F0FF', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, "Value"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border-subtle">
        {data.slice(0, 4).map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-[10px] text-t2 font-medium truncate uppercase tracking-wider">{item.name}</span>
            <span className="text-[10px] text-t3 font-bold ml-auto">{((item.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
