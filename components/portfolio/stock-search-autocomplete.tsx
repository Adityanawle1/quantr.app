"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Stock {
    symbol: string;
    name: string;
    price: number;
}

interface StockSearchAutocompleteProps {
    onSelect: (stock: Stock) => void;
    className?: string;
    placeholder?: string;
    defaultValue?: string;
}

export function StockSearchAutocomplete({ onSelect, className, placeholder = "Search stock symbol or name...", defaultValue = "" }: StockSearchAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue);
    const [results, setResults] = useState<Stock[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 1) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(Array.isArray(data) ? data : []);
                setIsOpen(true);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t3" />
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value.toUpperCase());
                        setIsOpen(true);
                    }}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="pl-10 uppercase bg-navy-surf border-border-subtle focus-visible:ring-lime"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-3 h-3 animate-spin text-lime" />
                    </div>
                )}
            </div>

            {isOpen && (results.length > 0 || (query.length > 0 && !isLoading)) && (
                <div className="absolute z-50 w-full mt-2 bg-navy-card border border-border-subtle rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {results.length > 0 ? (
                        <div className="max-h-[240px] overflow-y-auto no-scrollbar py-1">
                            {results.map((stock) => (
                                <button
                                    key={stock.symbol}
                                    type="button"
                                    onClick={() => {
                                        onSelect(stock);
                                        setQuery(stock.symbol);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-highlight/50 transition-colors text-left group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-t1 group-hover:text-lime transition-colors">
                                            {stock.symbol}
                                        </span>
                                        <span className="text-[10px] text-t3 truncate max-w-[200px]">
                                            {stock.name}
                                        </span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[11px] font-mono font-bold text-t1">
                                            ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[9px] text-t3 uppercase tracking-tighter">Live Price</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : !isLoading && (
                        <div className="p-8 text-center">
                            <p className="text-xs text-t3 font-medium uppercase tracking-widest">No stocks found for "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
