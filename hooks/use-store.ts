"use client";

import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

interface MarketState {
  selectedIndex: string;
  setSelectedIndex: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedIndex: "^NSEI",
  setSelectedIndex: (symbol) => set({ selectedIndex: symbol }),
}));
