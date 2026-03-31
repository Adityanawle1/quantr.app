import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchAndUpsertFundamentals } from "@/lib/sync-market";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  
  if (!symbol) return NextResponse.json({ error: "No symbol" }, { status: 400 });

  const { data: stock } = await supabase.from("stocks").select("*").eq("symbol", symbol).single();
  if (stock) {
    await fetchAndUpsertFundamentals([stock]);
    return NextResponse.json({ success: true, stock });
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
