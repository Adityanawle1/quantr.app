'use client'
import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { useTheme } from 'next-themes'

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number }

interface Props {
  candles: Candle[]
  symbol: string
}

export default function CandlestickChart({ candles, symbol }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!chartRef.current || !candles.length) return

    const isDark = resolvedTheme === 'dark'
    const bg = isDark ? '#141413' : '#ffffff'
    const text = isDark ? '#9ca3af' : '#6b7280'
    const grid = isDark ? '#1c1c1a' : '#f0f0ee'

    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: bg }, textColor: text },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, fixLeftEdge: true, fixRightEdge: true },
      width: chartRef.current.clientWidth,
      height: 400,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#f87171',
    })

    const volSeries = chart.addSeries(HistogramSeries, {
      color: '#22c55e44',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    const formatted = candles.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))

    const volFormatted = candles.map(c => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? '#22c55e44' : '#f8717144',
    }))

    candleSeries.setData(formatted)
    volSeries.setData(volFormatted)
    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => chart.applyOptions({ width: chartRef.current!.clientWidth }))
    ro.observe(chartRef.current)

    return () => { chart.remove(); ro.disconnect() }
  }, [candles, resolvedTheme])

  return <div ref={chartRef} className="w-full" />
}
