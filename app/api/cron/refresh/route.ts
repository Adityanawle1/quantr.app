import { NextResponse } from "next/server";
import { runFullSync } from "@/lib/sync-market";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for Vercel serverless

export async function GET(request: Request) {
  // Vercel Cron sets this header automatically
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("[cron/refresh] 🕐 Nightly sync triggered at", new Date().toISOString());

    // Phase 1: Refresh the full symbol listing (1 API call)
    // Phase 2: Fetch fundamentals for the next batch via rolling cursor
    const result = await runFullSync("full", 400);

    console.log("[cron/refresh] ✅ Nightly sync completed:", JSON.stringify(result));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error("[cron/refresh] ❌ Nightly sync failed:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
