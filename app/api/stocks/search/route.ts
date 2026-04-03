import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    // Using plural table name 'stocks' which Screener API uses
    const { data: stocks, error } = await supabase
      .from("stocks")
      .select(`
        symbol,
        name,
        price
      `)
      .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(8);

    if (error) {
      console.error("[api/stocks/search] Supabase Error:", error.message);
      throw error;
    }

    const results = (stocks || []).map((s: any) => ({
      symbol: s.symbol,
      name: s.name,
      // Note: Screener showed price is in the 'stocks' table directly
      price: Number(s.price) || 0,
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("[api/stocks/search] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
