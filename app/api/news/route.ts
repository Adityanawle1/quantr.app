import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET() {
  try {
    if (!AV_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // Fetch Sentiment and News
    // We'll target Indian markets by using relevant topics or tickers if possible, 
    // but Alpha Vantage sentiment is mostly global. We'll filter for relevance.
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets,economy_macro&limit=50&apikey=${AV_KEY}`;
    
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!data.feed) {
      console.error("[api/news] AV Response Error:", data);
      return NextResponse.json({ summary: "Neutral", feed: [] });
    }

    // Calculate aggregated sentiment
    const feed = data.feed.map((item: any) => ({
      title: item.title,
      url: item.url,
      time: item.time_published,
      source: item.source,
      summary: item.summary,
      banner_image: item.banner_image,
      overall_sentiment_score: item.overall_sentiment_score,
      overall_sentiment_label: item.overall_sentiment_label,
      topics: item.topics
    }));

    const scores = feed.map((f: any) => f.overall_sentiment_score);
    const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

    let sentimentLabel = "Neutral";
    if (avgScore > 0.35) sentimentLabel = "Bullish";
    else if (avgScore > 0.15) sentimentLabel = "Somewhat Bullish";
    else if (avgScore < -0.35) sentimentLabel = "Bearish";
    else if (avgScore < -0.15) sentimentLabel = "Somewhat Bearish";

    return NextResponse.json({
      summary: sentimentLabel,
      avgScore,
      feed: feed.slice(0, 20) // Top 20 for the UI
    });
  } catch (error: any) {
    console.error("[api/news] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
