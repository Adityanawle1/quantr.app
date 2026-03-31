import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch top 5 stocks by price (simulating 52-week highs)
    const { data: highs, error } = await supabase
      .from("stocks")
      .select("symbol, price, market_cap")
      .order("price", { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json({ highs: highs || [] });
  } catch (err: any) {
    console.error("[api/dashboard/highs] Error:", err.message);
    return NextResponse.json({ highs: [] }, { status: 500 });
  }
}
