import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/auth-mock";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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

    // Ensure user exists
    await prisma.user.upsert({
        where: { id: DEMO_USER_ID },
        update: {},
        create: {
            id: DEMO_USER_ID,
            email: "demo@quantr.app",
            name: "Demo Investor",
        }
    });

    for (const row of rows) {
      const symbol = row.Symbol || row.symbol || row.Ticker || row.ticker;
      const quantity = parseFloat(row.Quantity || row.quantity || row.Qty || row.qty);
      const buyPrice = parseFloat(row.Price || row.price || row.AvgPrice || row.avg_price);

      if (!symbol || isNaN(quantity) || isNaN(buyPrice)) {
        errors.push({ row, error: "Missing or invalid fields" });
        continue;
      }

      const stock = await prisma.stock.findFirst({
        where: {
          OR: [
            { symbol: symbol.toString().toUpperCase() },
            { nsSymbol: symbol.toString().toUpperCase().endsWith(".NS") ? symbol.toString().toUpperCase() : `${symbol.toString().toUpperCase()}.NS` }
          ]
        }
      });

      if (!stock) {
        errors.push({ symbol, error: "Stock not found in database" });
        continue;
      }

      const entry = await prisma.portfolio.create({
        data: {
          userId: DEMO_USER_ID,
          stockId: stock.id,
          quantity,
          buyPrice,
          buyDate: row.Date ? new Date(row.Date) : null
        }
      });
      processed.push(entry);
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
