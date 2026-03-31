"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  timePublished: string;
  summary?: string;
}

function formatGeistMonoTimestamp(raw: string): string {
  if (!raw) return "";
  try {
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

export function MarketIntelligence() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const res = await fetch("/api/market/news");
        const json = await res.json();
        setArticles(json.articles || []);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex items-end justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 font-sans">
            Market Intelligence
          </h2>
          <p className="text-t3 text-sm">
            Curated strictly for Nifty 50 & Sensex themes. Powered by Alpha Intelligence™
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-zinc-800/50 rounded-2xl bg-zinc-900/20">
          <p className="text-sm text-t3 font-sans">No recent intelligence found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url !== "#" ? article.url : undefined}
              target={article.url !== "#" ? "_blank" : undefined}
              rel={article.url !== "#" ? "noopener noreferrer" : undefined}
              className="group flex flex-col justify-between p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm hover:bg-zinc-800/40 hover:border-zinc-700/80 transition-all duration-300 cursor-pointer h-full shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider shrink-0 shadow-sm border border-zinc-700/50">
                    {article.source}
                  </span>
                  <span
                    className="text-xs text-t3 tabular-nums"
                    style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
                  >
                    {formatGeistMonoTimestamp(article.timePublished)}
                  </span>
                </div>
                <h4 className="text-[17px] text-zinc-200 font-medium leading-[1.4] font-sans group-hover:text-t1 transition-colors">
                  {article.title}
                </h4>
              </div>
              
              {article.summary && (
                <p className="text-sm text-t3 mt-4 line-clamp-2 leading-relaxed font-sans group-hover:text-t2 transition-colors">
                  {article.summary}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
