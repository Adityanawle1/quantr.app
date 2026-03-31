"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ParsedHolding } from "./csv-uploader";

export function QuickAdd({ onUpload }: { onUpload: (holdings: ParsedHolding[]) => void }) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [holdings, setHoldings] = useState<ParsedHolding[]>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !quantity || !avgPrice) return;

    setHoldings(prev => [
      ...prev,
      {
        symbol: symbol.toUpperCase(),
        quantity: parseInt(quantity, 10),
        avgPrice: parseFloat(avgPrice)
      }
    ]);

    setSymbol("");
    setQuantity("");
    setAvgPrice("");
  };

  const handleRemove = (index: number) => {
    setHoldings(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <form onSubmit={handleAdd} className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-t2">Symbol</Label>
              <Input
                placeholder="e.g. RELIANCE"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 text-t1"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-t2">Quantity</Label>
              <Input
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 text-t1 tabular-nums"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-t2">Avg Price</Label>
              <Input
                type="number"
                min="0"
                step="0.05"
                placeholder="0.00"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 text-t1 tabular-nums"
              />
            </div>
            <Button type="submit" variant="secondary" className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-t1">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {holdings.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-zinc-200 font-medium text-sm">Holdings to Add ({holdings.length})</h4>
          <div className="space-y-2">
            {holdings.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 flex-row">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-emerald-400 w-24">{h.symbol}</span>
                  <span className="text-t2 tabular-nums">{h.quantity} shares</span>
                  <span className="text-t2 tabular-nums">@ ₹{h.avgPrice.toFixed(2)}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(i)} className="text-t3 hover:text-rose-400">
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-t1" onClick={() => onUpload(holdings)}>
            Sync {holdings.length} Holdings
          </Button>
        </div>
      )}
    </div>
  );
}
