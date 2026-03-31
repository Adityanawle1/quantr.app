"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchStocks } from "@/app/actions/search";
import { useDebounce } from "@/hooks/use-debounce";

export function UniversalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const data = await searchStocks(debouncedQuery);
      setResults(data);
      setIsLoading(false);
    }

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (symbol: string) => {
    setOpen(false);
    router.push(`/stocks/${symbol}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-navy-surf border border-border-subtle rounded-lg px-3 h-8 cursor-pointer transition-colors hover:border-border-subtle min-w-[190px] hidden sm:flex w-full"
      >
        <Search className="w-3.5 h-3.5 text-t3" />
        <span className="font-mono text-[10px] text-t3">Search symbol…</span>
        <span className="ml-auto text-[9px] bg-highlight border border-border-subtle rounded-[3px] px-1.5 py-[1px] text-t3">⌘K</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search stocks, sectors, or indices (e.g., Reliance, TCS, Nifty 50)" 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? "Searching..." : debouncedQuery.length < 2 ? "Type at least 2 characters..." : "No results found."}
          </CommandEmpty>
          <CommandGroup heading="Stocks">
            {results.map((stock) => (
              <CommandItem
                key={stock.symbol}
                value={`${stock.symbol} ${stock.name}`}
                onSelect={() => handleSelect(stock.symbol)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-t1">{stock.symbol}</span>
                  <span className="text-sm text-t3">{stock.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-t1">₹{stock.price}</span>
                  <span className="text-[10px] font-mono text-t3 bg-highlight px-2 py-0.5 rounded-md">{stock.exchange}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
