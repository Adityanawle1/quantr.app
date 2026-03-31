'use client'
import { usePortfolioStore } from '@/store/portfolioStore'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function AddToPortfolioButton({ symbol, name, price }: { symbol: string, name: string, price: number }) {
  const { addHolding } = usePortfolioStore()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addHolding({ symbol, name, avgPrice: price, quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
        added ? 'bg-[var(--gain-bg)] text-[var(--gain)]' : 'bg-[var(--accent)] text-t1 hover:bg-[var(--accent-hover)]'
      }`}
    >
      <Plus size={16} />
      {added ? 'Added!' : 'Add to Portfolio'}
    </button>
  )
}
