"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SavePresetDialog } from "./save-preset-dialog";
import { useState, useEffect, useCallback } from "react";

export interface ScreenerFilters {
  peMax: number | null;
  roeMin: number | null;
  roceMin: number | null;
  deMax: number | null;
  mcapMin: number | null;
  mcapMax: number | null;
  sector: string;
  excludeLoss: boolean;
  search: string;
  sort: string;
  order: string;
}

const DEFAULT_FILTERS: ScreenerFilters = {
  peMax: null,
  roeMin: null,
  roceMin: null,
  deMax: null,
  mcapMin: null,
  mcapMax: null,
  sector: "",
  excludeLoss: false,
  search: "",
  sort: "market_cap",
  order: "desc",
};

// Custom event for filter changes
const FILTER_EVENT = "screener-filters-changed";

export function emitFilterChange(filters: ScreenerFilters) {
  window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: filters }));
}

export function useScreenerFilters(callback: (filters: ScreenerFilters) => void) {
  useEffect(() => {
    const handler = (e: Event) => callback((e as CustomEvent).detail);
    window.addEventListener(FILTER_EVENT, handler);
    return () => window.removeEventListener(FILTER_EVENT, handler);
  }, [callback]);
}

const SECTORS = [
  "IT", "Finance", "Pharma", "Energy", "Auto", "FMCG", "Metals",
  "Infrastructure", "Real Estate", "Consumer Goods", "Telecom",
  "Healthcare", "Chemicals", "Materials", "Defence", "Retail",
  "Mining", "Travel", "Media",
];

export function ScreenerSidebar() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [peSlider, setPeSlider] = useState([100]);
  const [roeSlider, setRoeSlider] = useState([0]);
  const [roceSlider, setRoceSlider] = useState([0]);
  const [deSlider, setDeSlider] = useState([3]);
  const [mcapSlider, setMcapSlider] = useState([0, 100]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const applyFilters = useCallback(() => {
    const newFilters: ScreenerFilters = {
      ...filters,
      peMax: peSlider[0] < 100 ? peSlider[0] : null,
      roeMin: roeSlider[0] > 0 ? roeSlider[0] : null,
      roceMin: roceSlider[0] > 0 ? roceSlider[0] : null,
      deMax: deSlider[0] < 3 ? deSlider[0] : null,
      mcapMin: mcapSlider[0] > 0 ? mcapSlider[0] * 1e10 : null,  // slider in ₹1000 Cr units
      mcapMax: mcapSlider[1] < 100 ? mcapSlider[1] * 1e10 : null,
      sector: selectedSectors.join(","),
    };
    setFilters(newFilters);
    emitFilterChange(newFilters);
  }, [peSlider, roeSlider, roceSlider, deSlider, mcapSlider, selectedSectors, filters]);

  // Emit default filters on mount
  useEffect(() => {
    emitFilterChange(DEFAULT_FILTERS);
  }, []);

  const resetFilters = () => {
    setPeSlider([100]);
    setRoeSlider([0]);
    setRoceSlider([0]);
    setDeSlider([3]);
    setMcapSlider([0, 100]);
    setSelectedSectors([]);
    setFilters({ ...DEFAULT_FILTERS });
    emitFilterChange(DEFAULT_FILTERS);
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  return (
    <div className="flex flex-col space-y-6 h-full">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <h3 className="font-semibold text-[15px] text-t1">Filters</h3>
        <div className="flex space-x-2">
          <button
            onClick={resetFilters}
            className="text-[11px] font-mono text-t3 hover:text-t1 transition-colors"
          >
            Reset
          </button>
          <SavePresetDialog />
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 no-scrollbar">
        {/* Valuation Section */}
        <div className="space-y-4">
          <h4 className="font-mono text-[9px] font-medium text-t3 uppercase tracking-[2px]">Valuation</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[12px] font-semibold text-t1">P/E Ratio ≤</Label>
              <span className="text-[11px] text-t3 font-mono">
                {peSlider[0] >= 100 ? "Any" : peSlider[0]}
              </span>
            </div>
            <Slider
              value={peSlider}
              onValueChange={(v) => setPeSlider(v as number[])}
              max={100}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[12px] font-semibold text-t1">Market Cap</Label>
              <span className="text-[11px] text-t3 font-mono">
                {mcapSlider[0] === 0 && mcapSlider[1] >= 100
                  ? "Any"
                  : `${mcapSlider[0]}k - ${mcapSlider[1] >= 100 ? "∞" : mcapSlider[1] + "k"} Cr`}
              </span>
            </div>
            <Slider
              value={mcapSlider}
              onValueChange={(v) => setMcapSlider(v as number[])}
              max={100}
              step={5}
              className="py-2"
            />
          </div>
        </div>

        {/* Profitability Section */}
        <div className="space-y-4 pt-4 border-t border-border-subtle">
          <h4 className="font-mono text-[9px] font-medium text-t3 uppercase tracking-[2px]">Profitability</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[12px] font-semibold text-t1">ROE ≥</Label>
              <span className="text-[11px] text-t3 font-mono">
                {roeSlider[0] === 0 ? "Any" : `${roeSlider[0]}%`}
              </span>
            </div>
            <Slider
              value={roeSlider}
              onValueChange={(v) => setRoeSlider(v as number[])}
              max={50}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[12px] font-semibold text-t1">ROCE ≥</Label>
              <span className="text-[11px] text-t3 font-mono">
                {roceSlider[0] === 0 ? "Any" : `${roceSlider[0]}%`}
              </span>
            </div>
            <Slider
              value={roceSlider}
              onValueChange={(v) => setRoceSlider(v as number[])}
              max={50}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[12px] font-semibold text-t1">Debt/Equity ≤</Label>
              <span className="text-[11px] text-t3 font-mono">
                {deSlider[0] >= 3 ? "Any" : deSlider[0].toFixed(1)}
              </span>
            </div>
            <Slider
              value={deSlider}
              onValueChange={(v) => setDeSlider(v as number[])}
              max={3}
              step={0.1}
              className="py-2"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label className="text-[12px] font-semibold text-t1">Exclude Loss Making</Label>
            <Switch
              checked={filters.excludeLoss}
              onCheckedChange={(checked) =>
                setFilters((f) => ({ ...f, excludeLoss: checked }))
              }
            />
          </div>
        </div>

        {/* Sector Section */}
        <div className="space-y-4 pt-4 border-t border-border-subtle">
          <h4 className="font-mono text-[9px] font-medium text-t3 uppercase tracking-[2px]">Sector</h4>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-[10px] py-[3px] font-mono text-[10px] uppercase tracking-[1px] rounded-[6px] border transition-all ${
                  selectedSectors.includes(sector)
                    ? "bg-gaindm border-gainbr text-gain shadow-[0_0_10px_rgba(61,214,140,0.1)]"
                    : "border-border-subtle text-t3 hover:border-border-subtle hover:text-t1"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle space-y-2">
        <Button
          onClick={applyFilters}
          className="w-full bg-lime text-navy hover:brightness-110 hover:bg-lime font-semibold text-[13px]"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
