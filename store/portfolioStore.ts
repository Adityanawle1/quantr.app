import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PortfolioHolding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  addedAt: string
  // Live data (not persisted, fetched on mount)
  currentPrice?: number
  change?: number
  changePercent?: number
}

interface PortfolioStore {
  holdings: PortfolioHolding[]
  addHolding: (h: Omit<PortfolioHolding, 'id' | 'addedAt'>) => void
  removeHolding: (id: string) => void
  updateHolding: (id: string, patch: Partial<PortfolioHolding>) => void
  updateLiveData: (symbol: string, price: number, change: number, changePct: number) => void
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      holdings: [],
      addHolding: (h) => set(s => ({
        holdings: [...s.holdings, {
          ...h,
          id: crypto.randomUUID(),
          addedAt: new Date().toISOString(),
        }],
      })),
      removeHolding: (id) => set(s => ({ holdings: s.holdings.filter(h => h.id !== id) })),
      updateHolding: (id, patch) => set(s => ({
        holdings: s.holdings.map(h => h.id === id ? { ...h, ...patch } : h),
      })),
      updateLiveData: (symbol, price, change, changePct) => set(s => ({
        holdings: s.holdings.map(h =>
          h.symbol === symbol
            ? { ...h, currentPrice: price, change, changePercent: changePct }
            : h
        ),
      })),
    }),
    { name: 'quantr-portfolio' } // localStorage key
  )
)
