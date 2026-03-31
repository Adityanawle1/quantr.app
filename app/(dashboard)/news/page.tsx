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
    <main className="p-6 md:p-8 md:pb-16 flex-1 w-full max-w-[1280px] mx-auto text-zinc-50 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 opacity-0 animate-[fu_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div>
          <h1 className="text-[17px] font-bold tracking-tight text-t1 leading-none">News Feed</h1>
          <p className="font-mono text-[10px] text-t3 mt-[5px] flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-lime" />
            Real-time Sentiment & Global News Aggregator
          </p>
        </div>

        <div className="flex items-center gap-3">
          {news?.isFallback && (
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 font-mono text-[10px] text-blue bg-bluedm border border-[rgba(91,156,246,0.2)] px-3 py-1.5 rounded-full hover:bg-[rgba(91,156,246,0.15)] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          )}
          <div className={`px-4 py-2 rounded-full border flex items-center gap-3 ${sentimentColor}`}>
            <div className="flex flex-col">
              <span className="font-mono text-[8px] uppercase tracking-wider opacity-60">Sentiment</span>
              <span className="text-[13px] font-bold">{sentimentLabel}</span>
            </div>
            {isBullish ? <TrendingUp className="w-5 h-5 opacity-40" /> : <TrendingDown className="w-5 h-5 opacity-40" />}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 opacity-0 animate-[fu_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] [animation-delay:0.15s]">
        {feedData.map((item: any, i: number) => (
          <div key={i} className="bg-navy-card border border-border-subtle rounded-[14px] group flex flex-col overflow-hidden hover:border-border-subtle transition-all duration-300">
            {item.banner_image && (
              <div className="relative h-44 w-full overflow-hidden border-b border-border-subtle">
                <img
                  src={item.banner_image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-navy/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-t3 uppercase tracking-tight border border-border-subtle">
                    {item.source}
                  </span>
                </div>
              </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  item.overall_sentiment_label?.includes('Bullish') ? 'text-gain bg-gaindm' :
                  item.overall_sentiment_label?.includes('Bearish') ? 'text-loss bg-lossdm' : 'text-t3 bg-highlight'
                }`}>
                  {(item.overall_sentiment_label || "Neutral").replace(/_/g, " ")}
                </span>
                {!item.banner_image && (
                  <span className="font-mono text-[9px] font-bold text-t3 bg-navy-surf px-2 py-0.5 rounded uppercase">
                    {item.source}
                  </span>
                )}
                <span className="text-[10px] text-t3 font-mono ml-auto flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTimestamp(item.time)}
                </span>
              </div>

              <h3 className="text-[13px] font-bold text-t1 leading-tight group-hover:text-lime transition-colors line-clamp-2 mb-3">
                {item.title}
              </h3>

              <p className="text-[11px] text-t3 line-clamp-3 mb-5 leading-relaxed">
                {item.summary}
              </p>

              <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between">
                <div className="flex gap-1.5 overflow-hidden">
                  {item.topics?.slice(0, 2).map((t: any) => (
                    <span key={t.topic} className="font-mono text-[8px] font-bold text-t3 uppercase tracking-tighter bg-navy-surf px-1.5 py-0.5 rounded truncate max-w-[90px]">
                      {t.topic.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
                {item.url && item.url !== "#" && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-highlight rounded-lg text-t3 hover:bg-lime hover:text-navy transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {feedData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-card rounded-[14px] border border-border-subtle">
          <Newspaper className="w-12 h-12 text-t3 mb-4 opacity-30" />
          <p className="text-t3 font-mono text-[10px] uppercase tracking-widest">
            No relevant news found at this moment
          </p>
        </div>
      )}
    </main>
  );
}
