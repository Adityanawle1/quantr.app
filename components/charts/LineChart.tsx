'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineSeries } from 'lightweight-charts'
import { useTheme } from 'next-themes'

export default function LineChart({ candles, symbol }: { candles: any[]; symbol: string }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!chartRef.current || !candles.length) return
    const isDark = resolvedTheme === 'dark'
    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#141413' : '#ffffff' },
        textColor: isDark ? '#9ca3af' : '#6b7280',
      },
      grid: { vertLines: { color: 'transparent' }, horzLines: { color: isDark ? '#1c1c1a' : '#f0f0ee' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      width: chartRef.current.clientWidth,
      height: 400,
    })

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: false,
    })

    lineSeries.setData(candles.map(c => ({ time: c.time as any, value: c.close })))
    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => chart.applyOptions({ width: chartRef.current!.clientWidth }))
    ro.observe(chartRef.current)
    return () => { chart.remove(); ro.disconnect() }
  }, [candles, resolvedTheme])

  return <div ref={chartRef} className="w-full" />
}
