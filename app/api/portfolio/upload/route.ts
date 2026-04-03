import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Papa from "papaparse";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sync user profile
    await supabase.from("users").upsert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
      });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const result = Papa.parse(text, { 
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    const rows = result.data as any[];
    const processed = [];
    const errors = [];
    const now = new Date().toISOString();

    for (const row of rows) {
      const symbol = (row.Symbol || row.symbol || row.Ticker || row.ticker)?.toString() || "";
      const quantity = parseFloat(row.Quantity || row.quantity || row.Qty || row.qty);
      const buyPrice = parseFloat(row.Price || row.price || row.AvgPrice || row.avg_price);

      if (!symbol || isNaN(quantity) || isNaN(buyPrice)) {
        errors.push({ row, error: "Missing or invalid fields" });
        continue;
      }

      // Find stock
      const { data: stock, error: stockErr } = await supabase
        .from("stocks")
        .select("id")
        .or(`symbol.eq.${symbol.toUpperCase()},nsSymbol.eq.${symbol.toUpperCase().endsWith(".NS") ? symbol.toUpperCase() : symbol.toUpperCase() + ".NS"}`)
        .maybeSingle();

      if (stockErr || !stock) {
        errors.push({ symbol, error: "Stock not found in database" });
        continue;
      }

      // Consistent naming: user_id, stock_id, buy_price, buy_date, updatedAt, createdAt
      const { data: entry, error: insertErr } = await supabase
        .from("portfolios")
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          stock_id: stock.id,
          quantity,
          buy_price: buyPrice,
          buy_date: row.Date ? new Date(row.Date).toISOString() : now,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();

      if (insertErr) {
        console.error(`[api/portfolio/upload] Failed for ${symbol}:`, insertErr.message);
        errors.push({ symbol, error: insertErr.message });
      } else {
        processed.push(entry);
      }
    }

    return NextResponse.json({
      message: `Processed ${processed.length} holdings.`,
      count: processed.length,
      errors: errors
    });

  } catch (error: any) {
    console.error("[api/portfolio/upload] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
