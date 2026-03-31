"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddHoldingButtonProps {
    defaultSymbol?: string;
    defaultPrice?: number;
    variant?: "default" | "outline" | "ghost";
    className?: string;
}

export function AddHoldingButton({ defaultSymbol = "", defaultPrice, variant = "default", className = "" }: AddHoldingButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [symbol, setSymbol] = useState(defaultSymbol);
    const [quantity, setQuantity] = useState("");
    const [buyPrice, setBuyPrice] = useState(defaultPrice ? defaultPrice.toString() : "");
    const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
    const [error, setError] = useState("");
    
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: async () => {
            setError("");
            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    quantity: parseFloat(quantity),
                    buyPrice: parseFloat(buyPrice),
                    buyDate
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add holding");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-intelligence"] });
            setIsOpen(false);
            if (!defaultSymbol) setSymbol("");
            setQuantity("");
            if (!defaultPrice) setBuyPrice("");
        },
        onError: (err: any) => {
            setError(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol || !quantity || !buyPrice) {
            setError("Please fill out all required fields.");
            return;
        }
        addMutation.mutate();
    };

    const buttonStyles = variant === "outline" 
        ? "border border-border-subtle hover:bg-highlight text-t1 bg-highlight/50"
        : "bg-lime border border-lime hover:opacity-90 text-background shadow-lg shadow-lime/10";

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-all text-[11px] uppercase tracking-widest ${buttonStyles} ${className}`}
            >
                <Plus className="w-4 h-4" />
                Add to Portfolio
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px] bg-navy-card border-border-subtle">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold font-jakarta pt-2">Add Holding</DialogTitle>
                        <DialogDescription className="text-t3">
                            Manually add a stock transaction to your portfolio.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-loss/10 border border-loss/20 text-loss text-xs">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="symbol" className="text-xs uppercase tracking-widest text-t3">Stock Symbol</Label>
                            <Input 
                                id="symbol" 
                                value={symbol} 
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
                                placeholder="e.g. RELIANCE"
                                className="uppercase bg-navy-surf border-border-subtle focus-visible:ring-lime"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-xs uppercase tracking-widest text-t3">Quantity</Label>
                                <Input 
                                    id="quantity" 
                                    type="number" 
                                    step="any"
                                    value={quantity} 
                                    onChange={(e) => setQuantity(e.target.value)} 
                                    placeholder="e.g. 50"
                                    className="bg-navy-surf border-border-subtle focus-visible:ring-lime"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="buyPrice" className="text-xs uppercase tracking-widest text-t3">Buy Price (₹)</Label>
                                <Input 
                                    id="buyPrice" 
                                    type="number" 
                                    step="any"
                                    value={buyPrice} 
                                    onChange={(e) => setBuyPrice(e.target.value)} 
                                    placeholder="e.g. 2950"
                                    className="bg-navy-surf border-border-subtle focus-visible:ring-lime"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="buyDate" className="text-xs uppercase tracking-widest text-t3">Purchase Date</Label>
                            <Input 
                                id="buyDate" 
                                type="date"
                                value={buyDate} 
                                onChange={(e) => setBuyDate(e.target.value)} 
                                className="bg-navy-surf border-border-subtle focus-visible:ring-lime text-t2"
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t border-border-subtle mt-6">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 font-bold text-xs uppercase tracking-widest text-t3 hover:text-t1 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addMutation.isPending}
                                className="flex items-center gap-2 px-6 py-2 bg-lime text-background font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-lime/20 transition-all disabled:opacity-50"
                            >
                                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Transaction"}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
