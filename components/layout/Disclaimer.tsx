'use client'
import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function Disclaimer() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-3">
        <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-muted)] flex-1 leading-relaxed">
          <strong className="text-[var(--text)]">Investment Disclaimer:</strong>{' '}
          QUANTR is an information and research platform only. Nothing on this platform constitutes financial advice, a solicitation, or a recommendation to buy or sell securities. Stock market investments are subject to market risk. Past performance is not indicative of future results. Please consult a SEBI-registered investment advisor before making investment decisions.
        </p>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
