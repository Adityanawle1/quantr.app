"use server";

import { supabase } from "@/lib/supabase";

export async function searchStocks(query: string) {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("stocks")
      .select("symbol, name, price, exchange, sector")
      .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
      .order("market_cap", { ascending: false, nullsFirst: false })
      .limit(8);

    if (error) throw error;

    return (data || []).map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: Number(stock.price) || 0,
      exchange: stock.exchange || "NSE",
      sector: stock.sector || "",
    }));
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}
