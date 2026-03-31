import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ symbol: string }> }) {
  const params = await props.params;
  const symbol = params.symbol.toUpperCase()
  
  // We'll generate realistic-looking historical P/E data by varying it around a base value.
  // In a real app, this would query a financial database like Screener.in or Yahoo Finance fundamentals.
  
  // Let's create a deterministic random based on the symbol string length so it's consistent per stock but differs across stocks.
  const baseSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  let basePE = 20 + (baseSeed % 30) // PE between 20 and 50
  if (symbol === 'RELIANCE') basePE = 28
  if (symbol === 'TCS') basePE = 32
  if (symbol === 'HDFCBANK') basePE = 18

  const history = []
  
  // Generate 5 years of monthly PE data (60 points)
  const today = new Date()
  for (let i = 60; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    
    // Add sinusoidal variance + some noise
    const variance = Math.sin(baseSeed + i * 0.2) * 4;
    const noise = Math.cos(baseSeed * i) * 3;
    
    // Gradual trend: PE slightly inflating over time
    const trend = (60 - i) * 0.05
    
    const finalPE = Math.max(5, basePE + variance + noise + trend)
    
    history.push({
      date: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      pe: Number(finalPE.toFixed(1))
    })
  }

  return NextResponse.json({ symbol, history })
}
