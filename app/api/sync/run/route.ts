import { NextResponse } from "next/server";
import { runFullSync } from "@/lib/sync-market";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for Vercel

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") || "full") as "full" | "listings" | "fundamentals";
  const limit = parseInt(searchParams.get("limit") || "400", 10);

  // Basic auth check  
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow in dev without secret
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log(`[sync/run] Starting sync: mode=${mode}, limit=${limit}`);

    const result = await runFullSync(mode, limit);

    return NextResponse.json({
      success: true,
      mode,
      ...result,
    });
  } catch (err: any) {
    console.error("[sync/run] Error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
