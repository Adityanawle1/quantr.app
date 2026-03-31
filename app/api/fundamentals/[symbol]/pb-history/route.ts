import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ symbol: string }> }) {
  const params = await props.params;
  const symbol = params.symbol.toUpperCase()
  
  // Generate realistic-looking historical P/B data.
  const baseSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  let basePB = 2 + (baseSeed % 8) // PB between 2 and 10
  if (symbol === 'RELIANCE') basePB = 2.4
  if (symbol === 'TCS') basePB = 12.5
  if (symbol === 'HDFCBANK') basePB = 2.8

  const history = []
  
  const today = new Date()
  for (let i = 60; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    
    // Add sinusoidal variance + some noise
    const variance = Math.sin(baseSeed + i * 0.2) * 0.5;
    const noise = Math.cos(baseSeed * i) * 0.3;
    
    // Gradual trend
    const trend = (60 - i) * 0.01;
    
    const finalPB = Math.max(0.5, basePB + variance + noise + trend)
    
    history.push({
      date: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      pb: Number(finalPB.toFixed(2))
    })
  }

  return NextResponse.json({ symbol, history })
}
