"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownRight, ArrowUpRight, TrendingUp, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useScreenerFilters, type ScreenerFilters } from "./screener-sidebar";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  marketCap: number;
  marketCapFormatted: string;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
}

type SortField = "market_cap" | "price" | "pe_ratio" | "roe" | "roce" | "debt_to_equity";

export function ScreenerTable() {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortField, setSortField] = useState<SortField>("market_cap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<ScreenerFilters | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for filter changes from sidebar
  useScreenerFilters(
    useCallback((newFilters: ScreenerFilters) => {
      setFilters(newFilters);
      setStocks([]);
      setPage(1);
    }, [])
  );

  // Build URL from filters
  const buildUrl = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", "25");
      params.set("sort", sortField);
      params.set("order", sortOrder);

      if (filters) {
        if (filters.peMax !== null) params.set("pe_max", filters.peMax.toString());
        if (filters.roeMin !== null) params.set("roe_min", filters.roeMin.toString());
        if (filters.roceMin !== null) params.set("roce_min", filters.roceMin.toString());
        if (filters.deMax !== null) params.set("de_max", filters.deMax.toString());
        if (filters.mcapMin !== null) params.set("mcap_min", filters.mcapMin.toString());
        if (filters.mcapMax !== null) params.set("mcap_max", filters.mcapMax.toString());
        if (filters.sector) params.set("sector", filters.sector);
        if (filters.excludeLoss) params.set("exclude_loss", "true");
        if (filters.search) params.set("search", filters.search);
      }

      return `/api/screener?${params.toString()}`;
    },
    [filters, sortField, sortOrder]
  );

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(buildUrl(1));
        const json = await res.json();
        if (json.data) {
          const validStocks = json.data.filter((v: Stock, i: number, a: Stock[]) => a.findIndex(t => t.id === v.id) === i);
          setStocks(validStocks);
          setTotal(json.pagination.total);
          setTotalPages(json.pagination.totalPages);
          setPage(1);
        }
      } catch (error) {
        console.error("Failed to fetch screener data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [buildUrl]);

  // Infinite scroll - load more
  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(buildUrl(nextPage));
      const json = await res.json();
      if (json.data) {
        setStocks((prev) => {
          const combined = [...prev, ...json.data];
          return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        });
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, totalPages, loadingMore, buildUrl]);

  // Scroll detection for infinite scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setStocks([]);
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-3 h-3 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline" />
    );
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <h3 className="text-t3 text-[12px] font-medium">
          Showing <span className="text-t1 font-semibold">{total.toLocaleString()}</span> results
        </h3>
        <div className="font-mono text-[10px] text-t3 bg-navy-surf border border-border-subtle px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" /> Sorted by{" "}
          {sortField.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="rounded-[12px] border border-border-subtle overflow-auto bg-navy-card max-h-[70vh] no-scrollbar"
      >
        <Table>
          <TableHeader className="bg-navy-surf border-b border-border-subtle sticky top-0 z-10">
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="font-medium text-[11px] text-t3 uppercase tracking-wider">Company</TableHead>
              <TableHead
                className="text-right font-medium text-[11px] text-t3 uppercase tracking-wider cursor-pointer hover:text-t1 transition-colors select-none"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center justify-end">
                  Price (₹)
                  <SortIcon field="price" />
                </div>
              </TableHead>
              <TableHead className="text-right font-medium text-[11px] text-t3 uppercase tracking-wider">
                <div className="flex items-center justify-end">
                  Change
                </div>
              </TableHead>
              <TableHead
                className="text-right font-medium text-[11px] text-t3 uppercase tracking-wider cursor-pointer hover:text-t1 transition-colors select-none"
                onClick={() => handleSort("market_cap")}
              >
                <div className="flex items-center justify-end">
                  M.Cap
                  <SortIcon field="market_cap" />
                </div>
              </TableHead>
              <TableHead
                className="text-right font-medium text-[11px] text-t3 uppercase tracking-wider cursor-pointer hover:text-t1 transition-colors select-none"
                onClick={() => handleSort("pe_ratio")}
              >
                <div className="flex items-center justify-end">
                  P/E
                  <SortIcon field="pe_ratio" />
                </div>
              </TableHead>
              <TableHead
                className="text-right font-medium text-[11px] text-t3 uppercase tracking-wider cursor-pointer hover:text-t1 transition-colors select-none"
                onClick={() => handleSort("roe")}
              >
                <div className="flex items-center justify-end">
                  ROE
                  <SortIcon field="roe" />
                </div>
              </TableHead>
              <TableHead
                className="text-right font-medium text-[11px] text-t3 uppercase tracking-wider cursor-pointer hover:text-t1 transition-colors select-none"
                onClick={() => handleSort("roce")}
              >
                <div className="flex items-center justify-end">
                  ROCE
                  <SortIcon field="roce" />
                </div>
              </TableHead>
              <TableHead
                className="text-right font-medium text-[11px] text-t3 uppercase tracking-wider cursor-pointer hover:text-t1 transition-colors select-none"
                onClick={() => handleSort("debt_to_equity")}
              >
                <div className="flex items-center justify-end">
                  D/E
                  <SortIcon field="debt_to_equity" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-t3">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-lime" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Loading stocks...</span>
                </TableCell>
              </TableRow>
            ) : stocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-t3">
                  <span className="font-mono text-[11px]">No stocks match your filters. Try adjusting the criteria.</span>
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock, idx) => {
                const changeNum = typeof stock.change === "number" ? stock.change : 0;
                const isPositive = changeNum >= 0;

                return (
                  <TableRow
                    key={`${stock.id}-${idx}`}
                    className="border-b border-border-subtle group hover:bg-highlight-hov transition-colors duration-200 cursor-pointer"
                    onClick={() => router.push(`/stocks/${stock.symbol}`)}
                  >
                    <TableCell className="py-3">
                      <Link href={`/stocks/${stock.symbol}`} className="block">
                        <div className="flex flex-col">
                          <span className="font-mono text-[12px] font-semibold text-t1 group-hover:text-lime transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] text-t3 line-clamp-1 mt-0.5">
                            {stock.name}
                            {stock.sector ? ` · ${stock.sector}` : ""}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[12px] tabular-nums text-t1 font-medium">
                      {stock.price > 0
                        ? stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div
                        className={`flex items-center justify-end font-mono text-[11px] font-semibold ${isPositive ? "text-gain" : "text-loss"}`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        )}
                        {Math.abs(changeNum).toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-t3 tabular-nums">
                      {stock.marketCapFormatted || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-t3 tabular-nums">
                      {stock.pe !== null ? stock.pe.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-t3 tabular-nums">
                      {stock.roe !== null ? `${stock.roe.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-t3 tabular-nums">
                      {stock.roce !== null ? `${stock.roce.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-t3 tabular-nums">
                      {stock.debtToEquity !== null ? stock.debtToEquity.toFixed(2) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            {loadingMore && (
              <TableRow>
                <TableCell colSpan={8} className="h-16 text-center text-t3">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-lime" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && stocks.length > 0 && (
        <div className="text-center font-mono text-[10px] text-t3 py-2">
          Showing {stocks.length} of {total.toLocaleString()} results
          {page < totalPages && " — scroll for more"}
        </div>
      )}
    </div>
  );
}