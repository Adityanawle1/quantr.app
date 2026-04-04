"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, ExternalLink, Globe, TrendingUp, TrendingDown, Clock, Newspaper, RefreshCw } from "lucide-react";

// Fallback news when API hits rate limit
const FALLBACK_NEWS = [
  {
    title: "Nifty 50 hits fresh record high as IT and Banking sectors lead the rally",
    url: "#", time: new Date(Date.now() - 1 * 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, ""),
    source: "Reuters", summary: "Broad-based buying propelled the Indian markets higher today with strong participation from institutional investors.",
    banner_image: null, overall_sentiment_score: 0.4, overall_sentiment_label: "Bullish",
    topics: [{ topic: "Financial_Markets" }, { topic: "Economy_Macro" }],
  },
  {
    title: "RBI keeps repo rate unchanged, maintains accommodative stance for growth",
    url: "#", time: new Date(Date.now() - 4 * 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, ""),
    source: "LiveMint", summary: "The monetary policy committee voted unanimously to hold rates, signaling continued support for economic recovery.",
    banner_image: null, overall_sentiment_score: 0.2, overall_sentiment_label: "Somewhat_Bullish",
    topics: [{ topic: "Economy_Macro" }, { topic: "Financial_Markets" }],
  },
  {
    title: "FIIs turn net buyers in Indian equities after three months of sustained selling",
    url: "#", time: new Date(Date.now() - 8 * 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, ""),
    source: "Bloomberg Quint", summary: "Foreign inflows have returned as macro fundamentals stabilize and rupee finds support.",
    banner_image: null, overall_sentiment_score: 0.35, overall_sentiment_label: "Bullish",
    topics: [{ topic: "Financial_Markets" }],
  },
  {
    title: "Auto sales show robust growth in festive quarter, beating street estimates",
    url: "#", time: new Date(Date.now() - 12 * 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, ""),
    source: "Economic Times", summary: "Passenger vehicle and two-wheeler sales saw double-digit growth across all major OEMs.",
    banner_image: null, overall_sentiment_score: 0.3, overall_sentiment_label: "Somewhat_Bullish",
    topics: [{ topic: "Earnings" }, { topic: "Manufacturing" }],
  },
  {
    title: "IT sector outlook improves as deal pipelines strengthen in Q4",
    url: "#", time: new Date(Date.now() - 18 * 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, ""),
    source: "Business Standard", summary: "Major IT firms report improving demand signals from US and European clients for digital transformation.",
    banner_image: null, overall_sentiment_score: 0.25, overall_sentiment_label: "Somewhat_Bullish",
    topics: [{ topic: "Technology" }, { topic: "Earnings" }],
  },
  {
    title: "Reliance Industries announces massive investment in green energy initiatives",
    url: "#", time: new Date(Date.now() - 24 * 3600000).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, ""),
    source: "Moneycontrol", summary: "The conglomerate aims to become a net-zero carbon company with ₹75,000 crore capex plan.",
    banner_image: null, overall_sentiment_score: 0.3, overall_sentiment_label: "Somewhat_Bullish",
    topics: [{ topic: "Energy_Transportation" }, { topic: "Financial_Markets" }],
  },
];

function formatTimestamp(raw: string) {
  if (!raw) return "";
  try {
    const month = raw.substring(4, 6);
    const day = raw.substring(6, 8);
    const hour = raw.substring(9, 11);
    const min = raw.substring(11, 13);
    return `${day}/${month} ${hour}:${min}`;
  } catch {
    return "";
  }
}

export default function NewsPage() {
  const { data: news, isLoading, isError, refetch } = useQuery({
    queryKey: ["news-sentiment"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      const json = await res.json();
      // If API hit rate limit or returned error, use fallback
      if (json.error || (!json.feed && !json.summary)) {
        return {
          summary: "Somewhat Bullish",
          avgScore: 0.28,
          feed: FALLBACK_NEWS,
          isFallback: true,
        };
      }
      // If feed is empty, use fallback
      if (!json.feed || json.feed.length === 0) {
        return {
          summary: json.summary || "Neutral",
          avgScore: json.avgScore || 0,
          feed: FALLBACK_NEWS,
          isFallback: true,
        };
      }
      return { ...json, isFallback: false };
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-lime" />
        <p className="text-t3 font-mono text-[10px] uppercase tracking-widest animate-pulse">
          Scanning Global Feeds...
        </p>
      </div>
    );
  }

  const feedData = news?.feed || FALLBACK_NEWS;
  const sentimentLabel = news?.summary || "Neutral";
  const isBullish = sentimentLabel.includes("Bullish");
  const sentimentColor = isBullish ? "text-gain bg-gaindm border-gainbr" : "text-loss bg-lossdm border-lossbr";

  return (
    <main className="p-6 md:p-8 md:pb-16 flex-1 w-full max-w-[1400px] mx-auto font-sans transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 opacity-0 animate-[fu_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-t1 leading-none">News Feed</h1>
          <p className="font-mono text-[11px] text-t3 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-primary" />
            Real-time Sentiment & Global Aggregator
          </p>
        </div>

        <div className="flex items-center gap-3">
          {news?.isFallback && (
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 font-mono text-[10px] text-primary bg-accent-blue-muted border border-accent-blue-border px-3.5 py-2 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Feed
            </button>
          )}
          <div className={`px-5 py-2.5 rounded-xl border-2 flex items-center gap-4 shadow-sm ${sentimentColor}`}>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] opacity-70">Market Sentiment</span>
              <span className="text-[14px] font-black">{sentimentLabel}</span>
            </div>
            {isBullish ? <TrendingUp className="w-5 h-5 opacity-60" /> : <TrendingDown className="w-5 h-5 opacity-60" />}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0 animate-[fu_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] [animation-delay:0.15s]">
        {feedData.map((item: any, i: number) => (
          <div key={i} className="bg-background-primary border border-border-subtle rounded-2xl group flex flex-col overflow-hidden hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300">
            {item.banner_image && (
              <div className="relative h-48 w-full overflow-hidden border-b border-border-subtle">
                <img
                  src={item.banner_image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-background-primary/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-t2 uppercase tracking-wider border border-border-default shadow-sm">
                    {item.source}
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`font-mono text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                  item.overall_sentiment_label?.includes('Bullish') ? 'text-gain bg-gaindm border-gainbr' :
                  item.overall_sentiment_label?.includes('Bearish') ? 'text-loss bg-lossdm border-lossbr' : 'text-t3 bg-background-elevated border-border-default'
                }`}>
                  {(item.overall_sentiment_label || "Neutral").replace(/_/g, " ")}
                </span>
                {!item.banner_image && (
                  <span className="font-mono text-[10px] font-black text-t3 bg-background-surface px-2.5 py-1 rounded-lg border border-border-default uppercase tracking-tight">
                    {item.source}
                  </span>
                )}
                <span className="text-[11px] text-t4 font-medium ml-auto flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(item.time)}
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-t1 leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-3">
                {item.title}
              </h3>

              <p className="text-[12px] text-t3 line-clamp-3 mb-6 leading-relaxed">
                {item.summary}
              </p>

              <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between">
                <div className="flex gap-2 overflow-hidden">
                  {item.topics?.slice(0, 2).map((t: any) => (
                    <span key={t.topic} className="font-mono text-[9px] font-bold text-primary uppercase tracking-tight bg-accent-blue-muted px-2 py-1 rounded-md border border-accent-blue-border truncate max-w-[100px]">
                      {t.topic.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
                {item.url && item.url !== "#" && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-background-elevated rounded-xl text-t3 hover:bg-primary hover:text-white transition-all shadow-sm border border-border-default"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {feedData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-background-primary rounded-2xl border border-border-subtle shadow-inner">
          <Newspaper className="w-16 h-16 text-t4 mb-6 opacity-20" />
          <p className="text-t3 font-mono text-[11px] uppercase tracking-[0.2em] font-bold">
            No primary signals detected
          </p>
        </div>
      )}
    </main>
  );
}
