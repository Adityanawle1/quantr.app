import { NextResponse } from "next/server";
import { getChartData } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "1w";
    
    const data = await getChartData(symbol, period);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[api/stocks/chart] Error:`, error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
