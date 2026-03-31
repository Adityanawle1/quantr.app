'use client'
export default function ShareholdingPattern({ symbol }: { symbol: string }) {
  return (
    <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Shareholding Pattern</h3>
      <div className="h-[200px] flex items-center justify-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl">
        Shareholding chart for {symbol}
      </div>
    </section>
  )
}
