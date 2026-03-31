import { NextRequest, NextResponse } from "next/server";
import { getYfIndices } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const data = await getYfIndices();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No index data available" }, { status: 503 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Index API Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch indices" }, { status: 500 });
  }
}
