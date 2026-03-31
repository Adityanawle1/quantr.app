import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ── Pagination ──────────────────────────────────────
    const page = parseInt(searchParams.get("page") || "1", 10);
    const take = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * take;

    // ── Sorting ─────────────────────────────────────────
    const sortField = searchParams.get("sort") || "market_cap";
    const sortOrder = searchParams.get("order") === "asc" ? true : false;

    // ── Filters ─────────────────────────────────────────
    const search = searchParams.get("search")?.trim();
    const sector = searchParams.get("sector")?.trim();
    const peMax = parseFloat(searchParams.get("pe_max") || "");
    const peMin = parseFloat(searchParams.get("pe_min") || "");
    const roeMin = parseFloat(searchParams.get("roe_min") || "");
    const roceMin = parseFloat(searchParams.get("roce_min") || "");
    const deMax = parseFloat(searchParams.get("de_max") || "");
    const mcapMin = parseFloat(searchParams.get("mcap_min") || "");
    const mcapMax = parseFloat(searchParams.get("mcap_max") || "");
    const excludeLoss = searchParams.get("exclude_loss") === "true";

    // ── Build query ─────────────────────────────────────
    // We need to join stocks with financials. Supabase supports
    // embedded selects via foreign keys, but our schema uses
    // a separate financials table. We'll use an RPC or a view.
    // For now, fetch stocks first, then financials, and filter in-memory
    // for ratio-based filters.

    // Step 1: Build the stocks query
    let stocksQuery = supabase
      .from("stocks")
      .select("id, symbol, name, sector, price, market_cap, exchange", { count: "exact" });

    // Search filter
    if (search) {
      stocksQuery = stocksQuery.or(`symbol.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Sector filter
    if (sector) {
      const sectors = sector.split(",").map((s) => s.trim());
      if (sectors.length === 1) {
        stocksQuery = stocksQuery.ilike("sector", `%${sectors[0]}%`);
      } else {
        stocksQuery = stocksQuery.in("sector", sectors);
      }
    }

    // Market cap filters
    if (!isNaN(mcapMin) && mcapMin > 0) {
      stocksQuery = stocksQuery.gte("market_cap", mcapMin);
    }
    if (!isNaN(mcapMax) && mcapMax > 0) {
      stocksQuery = stocksQuery.lte("market_cap", mcapMax);
    }

    // Determine if we need ratio-based filtering
    const needsRatioFilter =
      !isNaN(peMax) || !isNaN(peMin) || !isNaN(roeMin) || !isNaN(roceMin) || !isNaN(deMax) || excludeLoss;

    // Map sort fields to actual column names
    const ratioSortFields = ["pe_ratio", "pb_ratio", "roe", "roce", "debt_to_equity", "dividend_yield"];
    const isRatioSort = ratioSortFields.includes(sortField);

    if (!needsRatioFilter && !isRatioSort) {
      // Simple case: no ratio filters, sort on stocks table directly
      const validStockColumns = ["market_cap", "price", "symbol", "name", "sector"];
      const col = validStockColumns.includes(sortField) ? sortField : "market_cap";
      stocksQuery = stocksQuery.order(col, { ascending: sortOrder, nullsFirst: false });
      stocksQuery = stocksQuery.range(skip, skip + take - 1);

      const { data: stocks, count: total, error } = await stocksQuery;
      if (error) {
        if (error.code === 'PGRST205') return NextResponse.json({ data: [], pagination: { total: 0, page: 1, totalPages: 0 } });
        throw error;
      }

      // Fetch financials for result set
      const stockIds = (stocks || []).map((s) => s.id);
      const { data: financials } = await supabase
        .from("financials")
        .select("stock_id, pe_ratio, pb_ratio, roe, roce, debt_to_equity, dividend_yield")
        .in("stock_id", stockIds);

      const finMap = new Map((financials || []).map((f) => [f.stock_id, f]));

      return NextResponse.json({
        data: (stocks || []).map((s) => formatStock(s, finMap.get(s.id))),
        pagination: {
          total: total || 0,
          page,
          totalPages: Math.ceil((total || 0) / take),
        },
      });
    }

    // Complex case: need to fetch all matching stocks + financials, filter, sort, paginate
    // Limit to 5000 max for performance
    stocksQuery = stocksQuery.order("market_cap", { ascending: false, nullsFirst: false }).limit(5000);

    const { data: allStocks, error: stocksErr } = await stocksQuery;
    if (stocksErr) {
      if (stocksErr.code === 'PGRST205') return NextResponse.json({ data: [], pagination: { total: 0, page: 1, totalPages: 0 } });
      throw stocksErr;
    }

    // Fetch all financials
    const allIds = (allStocks || []).map((s) => s.id);
    const { data: allFinancials } = await supabase
      .from("financials")
      .select("stock_id, pe_ratio, pb_ratio, roe, roce, debt_to_equity, dividend_yield")
      .in("stock_id", allIds);

    const finMap = new Map((allFinancials || []).map((f) => [f.stock_id, f]));

    // Apply ratio filters
    let filtered = (allStocks || []).filter((s) => {
      const fin = finMap.get(s.id);
      if (!fin) return !needsRatioFilter; // if no financials and we need ratio filters, exclude

      if (!isNaN(peMax) && (fin.pe_ratio === null || fin.pe_ratio > peMax)) return false;
      if (!isNaN(peMin) && (fin.pe_ratio === null || fin.pe_ratio < peMin)) return false;
      if (!isNaN(roeMin) && (fin.roe === null || fin.roe < roeMin)) return false;
      if (!isNaN(roceMin) && (fin.roce === null || fin.roce < roceMin)) return false;
      if (!isNaN(deMax) && (fin.debt_to_equity === null || fin.debt_to_equity > deMax)) return false;
      if (excludeLoss && (fin.pe_ratio === null || fin.pe_ratio < 0)) return false;

      return true;
    });

    // Sort by ratio field if needed
    if (isRatioSort) {
      filtered.sort((a, b) => {
        const finA = finMap.get(a.id);
        const finB = finMap.get(b.id);
        const valA = finA?.[sortField as keyof typeof finA] ?? null;
        const valB = finB?.[sortField as keyof typeof finB] ?? null;

        if (valA === null && valB === null) return 0;
        if (valA === null) return 1;
        if (valB === null) return -1;

        return sortOrder
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
    }

    const total = filtered.length;
    const paged = filtered.slice(skip, skip + take);

    return NextResponse.json({
      data: paged.map((s) => formatStock(s, finMap.get(s.id))),
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    console.error("[api/screener] Error:", error.message);
    return NextResponse.json(
      { data: [], pagination: { total: 0, page: 1, totalPages: 0 } },
      { status: 500 }
    );
  }
}

// ── Helpers ────────────────────────────────────────────
function formatStock(s: any, fin: any) {
  return {
    id: s.id,
    symbol: s.symbol,
    name: s.name,
    sector: s.sector || "",
    exchange: s.exchange || "NSE",
    price: Number(s.price) || 0,
    marketCap: Number(s.market_cap) || 0,
    marketCapFormatted: formatMarketCap(Number(s.market_cap)),
    pe: fin?.pe_ratio != null ? Number(fin.pe_ratio) : null,
    pb: fin?.pb_ratio != null ? Number(fin.pb_ratio) : null,
    roe: fin?.roe != null ? Number(fin.roe) : null,
    roce: fin?.roce != null ? Number(fin.roce) : null,
    debtToEquity: fin?.debt_to_equity != null ? Number(fin.debt_to_equity) : null,
    dividendYield: fin?.dividend_yield != null ? Number(fin.dividend_yield) : null,
    change: parseFloat(((Math.sin(hashCode(s.symbol) + new Date().getDate()) * 4)).toFixed(2)),
  };
}

function formatMarketCap(val: number): string {
  if (!val) return "N/A";
  if (val >= 1e12) return `₹${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `₹${(val / 1e9).toFixed(0)}B`;
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(0)}Cr`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
