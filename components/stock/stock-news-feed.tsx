"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  timePublished: string;
  summary: string;
  sentiment: "bullish" | "bearish" | "neutral";
  sentimentScore: number;
  relevanceScore: number;
  bannerImage: string | null;
}

interface StockNewsFeedProps {
  symbol: string;
}

function formatTimestamp(raw: string): string {
  // Alpha Vantage format: "20250318T143000" or ISO-like
  if (!raw) return "";
  try {
    // Parse "20250318T143000" → "2025-03-18T14:30:00"
    const cleaned = raw.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).*$/,
      "$1-$2-$3T$4:$5:$6"
    );
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) return raw;

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor(diffMs / 60000);

    if (diffM < 60) return `${diffM}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

function SentimentDot({ sentiment }: { sentiment: "bullish" | "bearish" | "neutral" }) {
  const colors = {
    bullish: "bg-emerald-400 shadow-emerald-400/50",
    bearish: "bg-rose-400 shadow-rose-400/50",
    neutral: "bg-zinc-500 shadow-zinc-500/30",
  };

  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full shadow-[0_0_6px] shrink-0 mt-[7px] ${colors[sentiment]}`}
      title={sentiment}
    />
  );
}

export function StockNewsFeed({ symbol }: StockNewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/news?symbol=${symbol}`);
        const json = await res.json();
        setArticles(json.articles || []);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [symbol]);

  return (
    <div className="bento-card p-6">
      <h3 className="text-sm font-medium text-t2 uppercase tracking-wider mb-5">
        Latest Intelligence
      </h3>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-8">
          No recent news found for {symbol}.
        </p>
      ) : (
        <div className="space-y-1">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-3 py-3 -mx-3 rounded-lg hover:bg-highlight-hov transition-colors duration-150 group cursor-pointer"
            >
              <SentimentDot sentiment={article.sentiment} />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-t1 font-medium leading-snug group-hover:text-t1 transition-colors line-clamp-2">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[11px] text-zinc-600 tabular-nums"
                    style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
                  >
                    {formatTimestamp(article.timePublished)}
                  </span>
                  <span className="text-zinc-800">·</span>
                  <span className="text-[11px] text-zinc-600 truncate">
                    {article.source}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
