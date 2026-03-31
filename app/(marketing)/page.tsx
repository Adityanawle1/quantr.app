"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { GlobePulse } from "@/components/ui/cobe-globe-pulse";
import { DottedSurface } from "@/components/ui/dotted-surface";

/* ═══════════════════════════════════════════════════════
   Quantr — Landing Page (Integrated Next.js)
   Canvas background · Typewriter · Backend-connected data
   Live ticker tape · News feed · Staggered animations
   ═══════════════════════════════════════════════════════ */

// ── Types ──
interface IndexData {
  symbol: string;
  value: string;
  change: string;
  percent: string;
  isPositive: boolean;
}
interface GainerData {
  symbol: string;
  name: string;
  change: number;
}
interface TickerStock {
  symbol: string;
  price: number;
  change: number;
}
interface NewsArticle {
  title: string;
  url: string;
  source: string;
  summary?: string;
  timePublished?: string;
}

// ── Constants ──
const ACCENT = { r: 0, g: 232, b: 123 };
const PARTICLE_COUNT = 70;
const CONNECTION_DIST = 140;
const QUERIES = [
  "Find undervalued stocks with ROE > 20%",
  "Show high-ROCE compounders below ₹500 Cr",
  "Analyze Nifty 50 sector allocation",
  "Compare PE ratios across IT stocks",
  "Screen for low debt-to-equity mid caps",
];

// ── Helper: format news time ──
function formatNewsTime(raw?: string): string {
  if (!raw) return "";
  try {
    const y = raw.slice(0, 4), m = raw.slice(4, 6), d = raw.slice(6, 8);
    const h = raw.slice(9, 11), mi = raw.slice(11, 13);
    const date = new Date(`${y}-${m}-${d}T${h}:${mi}:00`);
    const diffH = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════
export default function QuantrLanding() {
  // ── State ──
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [placeholder, setPlaceholder] = useState("");

  // Backend data
  const [nifty, setNifty] = useState<IndexData | null>(null);
  const [sensex, setSensex] = useState<IndexData | null>(null);
  const [topGainer, setTopGainer] = useState<GainerData | null>(null);
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [tickerStocks, setTickerStocks] = useState<TickerStock[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);

  // Stats counters
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ stocks: 0, metrics: 0, refresh: 0, sectors: 0 });

  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    let qIdx = 0, cIdx = 0, isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const query = QUERIES[qIdx];
      if (!isDeleting) {
        setPlaceholder(query.slice(0, cIdx + 1));
        cIdx++;
        if (cIdx >= query.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 2400);
          return;
        }
        timeoutId = setTimeout(tick, 50 + Math.random() * 30);
      } else {
        setPlaceholder(query.slice(0, cIdx));
        cIdx--;
        if (cIdx <= 0) {
          isDeleting = false;
          qIdx = (qIdx + 1) % QUERIES.length;
          timeoutId = setTimeout(tick, 350);
          return;
        }
        timeoutId = setTimeout(tick, 22);
      }
    };
    timeoutId = setTimeout(tick, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

  // ═══════════════════════════════════════════════════════
  //  3. SCROLL + ANIMATIONS
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(() => setHeroVisible(true), 300);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ═══════════════════════════════════════════════════════
  //  4. FETCH BACKEND DATA
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    // Indices
    fetch("/api/market/indices")
      .then((r) => r.json())
      .then((data) => {
        if (data.indices?.length >= 2) {
          const n = data.indices.find((i: any) => i.symbol === "^NSEI") || data.indices[0];
          const s = data.indices.find((i: any) => i.symbol === "^BSESN") || data.indices[1];
          setNifty(n);
          setSensex(s);
        }
      })
      .catch(() => {});

    // Dashboard (gainers)
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.gainers?.[0]) setTopGainer(data.gainers[0]);
      })
      .catch(() => {});

    // Screener (ticker + count)
    fetch("/api/screener?limit=40&sort=market_cap&order=desc")
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.length > 0) {
          setTickerStocks(data.data);
          setStockCount(data.pagination?.total || data.data.length);
        }
      })
      .catch(() => {});

    // News
    fetch("/api/market/news")
      .then((r) => r.json())
      .then((data) => {
        if (data.articles?.length) setNews(data.articles.slice(0, 6));
      })
      .catch(() => {});

    // Refresh indices every 60s
    const interval = setInterval(() => {
      fetch("/api/market/indices")
        .then((r) => r.json())
        .then((data) => {
          if (data.indices?.length >= 2) {
            const n = data.indices.find((i: any) => i.symbol === "^NSEI") || data.indices[0];
            const s = data.indices.find((i: any) => i.symbol === "^BSESN") || data.indices[1];
            setNifty(n);
            setSensex(s);
          }
        })
        .catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ═══════════════════════════════════════════════════════
  //  5. STATS COUNTER ANIMATION
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!statsVisible) return;
    const targets = { stocks: stockCount || 5200, metrics: 120, refresh: 15, sectors: 22 };
    const duration = 1400;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCounters({
        stocks: Math.floor(targets.stocks * progress),
        metrics: Math.floor(targets.metrics * progress),
        refresh: Math.floor(targets.refresh * progress),
        sectors: Math.floor(targets.sectors * progress),
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [statsVisible, stockCount]);

  // Stats observer
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Ticker duplicated for seamless loop
  const tickerItems = [...tickerStocks, ...tickerStocks];

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="quantr-landing">
      <style>{landingCSS}</style>

      {/* ─── NAV ─── */}
      <nav className={`ql-nav ${scrolled ? "ql-nav--scrolled" : ""}`}>
        <div className="ql-nav__inner">
          <Link href="/" className="ql-nav__brand">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,26 2,26" stroke="#00e87b" strokeWidth="1.8" fill="none" />
              <line x1="14" y1="8" x2="14" y2="20" stroke="#00e87b" strokeWidth="1.4" />
            </svg>
            <span className="ql-nav__wordmark">Quantr</span>
          </Link>
          <div className="ql-nav__links">
            <a href="#features" className="ql-nav__pill">Screener</a>
            <a href="#features" className="ql-nav__pill">Analytics</a>
            <a href="#market-pulse" className="ql-nav__pill">Market Pulse</a>
          </div>
          <Link href="/dashboard" className="ql-btn ql-btn--primary ql-nav__cta">Launch App →</Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="ql-hero">
        <DottedSurface />
        <div className="absolute inset-y-0 right-[-20%] md:right-[0%] flex items-center justify-center opacity-80 z-[1] pointer-events-auto w-[800px] max-w-[80vw]">
          <GlobePulse />
        </div>

        {/* Signal Chips */}
        <div className={`ql-chip ql-chip--tl ${heroVisible ? "visible" : ""}`}>
          <span className="ql-chip__dot" />
          <span className="ql-chip__label">NIFTY 50</span>
          <span className="ql-chip__value">{nifty?.value ?? "—"}</span>
          <span className={`ql-chip__delta ${nifty?.isPositive ? "positive" : "negative"}`}>
            {nifty ? `${nifty.change} (${nifty.percent})` : "—"}
          </span>
        </div>
        <div className={`ql-chip ql-chip--tr ${heroVisible ? "visible" : ""}`}>
          <span className="ql-chip__dot" />
          <span className="ql-chip__label">SENSEX</span>
          <span className="ql-chip__value">{sensex?.value ?? "—"}</span>
          <span className={`ql-chip__delta ${sensex?.isPositive ? "positive" : "negative"}`}>
            {sensex ? `${sensex.change} (${sensex.percent})` : "—"}
          </span>
        </div>
        <div className={`ql-chip ql-chip--bl ${heroVisible ? "visible" : ""}`}>
          <span className="ql-chip__dot" />
          <span className="ql-chip__label">TOP GAINER</span>
          <span className="ql-chip__value">{topGainer?.symbol ?? "—"}</span>
          <span className="ql-chip__delta positive">
            {topGainer ? `+${Math.abs(topGainer.change).toFixed(2)}%` : "—"}
          </span>
        </div>
        <div className={`ql-chip ql-chip--br ${heroVisible ? "visible" : ""}`}>
          <span className="ql-chip__dot" />
          <span className="ql-chip__label">STOCKS TRACKED</span>
          <span className="ql-chip__value">{stockCount?.toLocaleString("en-IN") ?? "—"}</span>
          <span className="ql-chip__delta" style={{ color: "#00e87b" }}>Live</span>
        </div>

        {/* Hero Content */}
        <div className={`ql-hero__content ${heroVisible ? "visible" : ""}`}>
          <div className="ql-hero__pill">
            <span className="ql-hero__pill-dot"></span>
            Intelligence over Instinct
          </div>
          <h1 className="ql-hero__headline">Precision screening.<br/>Quantitative edge.</h1>
          <p className="ql-hero__sub">Real-time screening and quantitative analysis. Built for the Indian market.</p>

          <div className="ql-search">
            <div className="ql-search__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input type="text" className="ql-search__input" placeholder={placeholder} readOnly />
            <Link href="/screener" className="ql-search__go">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        <div className={`ql-hero__scroll ${heroVisible ? "visible" : ""}`}>
          <span>Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ─── TICKER TAPE ─── */}
      <section id="market-pulse" className="ql-ticker">
        <div className="ql-ticker__track">
          {tickerItems.length > 0 ? tickerItems.map((s, i) => (
            <span key={i} className="ql-ticker__item">
              <span className="ql-ticker__symbol">{s.symbol}</span>
              <span className="ql-ticker__price">₹{Number(s.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`ql-ticker__change ${(s.change || 0) >= 0 ? "up" : "down"}`}>
                {(s.change || 0) >= 0 ? "+" : ""}{(s.change || 0).toFixed(2)}%
              </span>
            </span>
          )) : <span className="ql-ticker__placeholder">Loading live market data…</span>}
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="ql-stats" ref={statsRef}>
        <div className="ql-stats__inner">
          <div className="ql-stat">
            <span className="ql-stat__num">{counters.stocks.toLocaleString("en-IN")}</span>
            <span className="ql-stat__label">Stocks Tracked</span>
          </div>
          <div className="ql-stat__divider" />
          <div className="ql-stat">
            <span className="ql-stat__num">{counters.metrics}</span>
            <span className="ql-stat__label">Screening Metrics</span>
          </div>
          <div className="ql-stat__divider" />
          <div className="ql-stat">
            <span className="ql-stat__num">{counters.refresh}</span>
            <span className="ql-stat__label">sec Data Refresh</span>
          </div>
          <div className="ql-stat__divider" />
          <div className="ql-stat">
            <span className="ql-stat__num">{counters.sectors}</span>
            <span className="ql-stat__label">Sectors Covered</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="ql-features">
        <div className="ql-features__header">
          <h2 className="ql-features__heading">Built for precision.</h2>
          <p className="ql-features__sub">Every tool a serious investor needs — nothing you don&apos;t.</p>
        </div>
        <div className="ql-features__grid">
          {[
            { title: "Multi-Factor Screener", desc: "Filter 5,000+ equities across PE, ROE, ROCE, market cap, debt ratios and 120+ more metrics — updated in real time from NSE & BSE.", link: "/screener", linkText: "Open Screener →", icon: "M3,3 h7v7h-7z M14,3 h7v7h-7z M3,14 h7v7h-7z M14,14 h7v7h-7z" },
            { title: "Quantitative Analytics", desc: "Sharpe ratios, tracking error, Jensen's alpha, and rolling-window attribution — pre-computed with zero lag.", link: "/dashboard", linkText: "View Analytics →", icon: "M22,12 L18,12 L15,21 L9,3 L6,12 L2,12" },
            { title: "Portfolio Intelligence", desc: "Track holdings, P&L, sector allocation, concentration risk, and AI-driven rebalancing signals — all in one view.", link: "/portfolio", linkText: "Manage Portfolio →", icon: "M12,2 L2,7 L12,12 L22,7z M2,17 L12,22 L22,17 M2,12 L12,17 L22,12" },
            { title: "Real-Time Market Data", desc: "Live Nifty 50, Sensex, sector heatmaps, market breadth indicators, and unusual-volume flags streamed to your dashboard.", link: "/dashboard", linkText: "Live Dashboard →", icon: "M12,2 a10,10 0 1,0 0.001,0 M12,6 v6 l4,2" },
            { title: "AI Research Assistant", desc: "Ask natural-language questions about any stock — Quantr's AI surfaces fundamentals, peer comparisons, and DCF estimates instantly.", link: "/dashboard", linkText: "Try QuantrGPT →", icon: "M21,11.5 a8.38,8.38 0 0,1 -0.9,3.8 a8.5,8.5 0 0,1 -7.6,4.7 a8.38,8.38 0 0,1 -3.8,-0.9 L3,21 l1.9,-5.7 a8.38,8.38 0 0,1 -0.9,-3.8 a8.5,8.5 0 0,1 4.7,-7.6 a8.38,8.38 0 0,1 3.8,-0.9 h0.5 a8.48,8.48 0 0,1 8,8 v0.5z" },
            { title: "Sector & Market Pulse", desc: "Track 22+ sectors with heatmaps, relative strength rankings, and FII/DII flow analytics — see where the money is moving.", link: "/dashboard", linkText: "Explore Sectors →", icon: "M18,20 V10 M12,20 V4 M6,20 V14" },
          ].map((f, i) => (
            <article key={i} className="ql-fcard">
              <div className="ql-fcard__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e87b" strokeWidth="1.5">
                  <path d={f.icon} />
                </svg>
              </div>
              <h3 className="ql-fcard__title">{f.title}</h3>
              <p className="ql-fcard__desc">{f.desc}</p>
              <Link href={f.link} className="ql-fcard__link">{f.linkText}</Link>
            </article>
          ))}
        </div>
      </section>

      {/* ─── NEWS ─── */}
      <section id="news" className="ql-news">
        <div className="ql-news__header">
          <h2 className="ql-news__heading">Market Intelligence Feed</h2>
          <p className="ql-news__sub">Live financial news from Reuters, Bloomberg, Economic Times & more.</p>
        </div>
        <div className="ql-news__grid">
          {news.length > 0 ? news.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="ql-newscard">
              <span className="ql-newscard__source">{a.source}</span>
              <h3 className="ql-newscard__title">{a.title}</h3>
              {a.summary && <p className="ql-newscard__summary">{a.summary}</p>}
              <span className="ql-newscard__time">{formatNewsTime(a.timePublished)}</span>
            </a>
          )) : <div className="ql-news__placeholder">Loading latest market news…</div>}
        </div>
        <div className="ql-news__more">
          <Link href="/dashboard" className="ql-btn ql-btn--outline">View All News →</Link>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="ql-cta">
        <DottedSurface />
        <div className="ql-cta__inner">
          <h2 className="ql-cta__heading">Ready to invest with precision?</h2>
          <p className="ql-cta__sub">Join thousands of investors using Quantr to make data-driven decisions.</p>
          <Link href="/dashboard" className="ql-btn ql-btn--primary ql-btn--lg">Launch Quantr — It&apos;s Free →</Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="ql-footer">
        <div className="ql-footer__inner">
          <div className="ql-footer__left">
            <span className="ql-footer__brand">Quantr</span>
            <p className="ql-footer__tagline">Institutional-grade research for every investor.</p>
          </div>
          <div className="ql-footer__cols">
            <div className="ql-footer__col">
              <span className="ql-footer__col-title">Platform</span>
              <Link href="/screener">Screener</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/portfolio">Portfolio</Link>
            </div>
            <div className="ql-footer__col">
              <span className="ql-footer__col-title">Resources</span>
              <Link href="/dashboard">Market News</Link>
              <Link href="/dashboard">Sectors</Link>
              <Link href="/dashboard">About</Link>
            </div>
          </div>
        </div>
        <div className="ql-footer__bottom">
          <span>© 2026 Quantr Technologies. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SCOPED CSS (injected as <style>)
// ═══════════════════════════════════════════════════════
const landingCSS = `
/* ─── Tokens ─── */
.quantr-landing {
  --ql-bg: #08090a;
  --ql-card: rgba(14,16,18,0.72);
  --ql-glass: rgba(18,22,26,0.55);
  --ql-surface: #111315;
  --ql-border: rgba(255,255,255,0.06);
  --ql-border2: rgba(255,255,255,0.1);
  --ql-text: #e8e8ea;
  --ql-dim: #8a8f98;
  --ql-xdim: #555960;
  --ql-accent: #00e87b;
  --ql-accent-dim: rgba(0,232,123,0.10);
  --ql-accent-glow: rgba(0,232,123,0.15);
  --ql-white: #f4f4f5;
  --ql-danger: #ff4d4d;
  --ql-radius: 12px;
  --ql-radius-sm: 8px;
  --ql-pill: 100px;
  --ql-sans: 'Inter',system-ui,-apple-system,sans-serif;
  --ql-serif: var(--font-dm-serif, 'DM Serif Display'),Georgia,serif;
  --ql-blur: 20px;
  --ql-tr: 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
  --ql-navh: 64px;

  font-family: var(--ql-sans);
  background: var(--ql-bg);
  color: var(--ql-text);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ─── Nav ─── */
.ql-nav {
  position: fixed; inset: 0 0 auto 0; height: var(--ql-navh); z-index: 100;
  backdrop-filter: blur(var(--ql-blur)); -webkit-backdrop-filter: blur(var(--ql-blur));
  background: rgba(8,9,10,0.6); border-bottom: 1px solid var(--ql-border);
  transition: background var(--ql-tr);
}
.ql-nav--scrolled { background: rgba(8,9,10,0.88); }
.ql-nav__inner { max-width:1280px; margin:0 auto; height:100%; display:flex; align-items:center; justify-content:space-between; padding:0 32px; }
.ql-nav__brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
.ql-nav__wordmark { font-size:1.2rem; font-weight:800; letter-spacing:-0.03em; color:var(--ql-white); }
.ql-nav__links { display:flex; gap:4px; }
.ql-nav__pill { padding:6px 18px; font-size:0.8rem; font-weight:500; border-radius:var(--ql-pill); color:var(--ql-dim); transition:color var(--ql-tr),background var(--ql-tr); text-decoration:none; }
.ql-nav__pill:hover { color:var(--ql-white); background:rgba(255,255,255,0.05); }

/* ─── Buttons ─── */
.ql-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:var(--ql-pill); font-size:0.82rem; font-weight:600; padding:10px 24px; transition:all var(--ql-tr); letter-spacing:-0.01em; cursor:pointer; text-decoration:none; }
.ql-btn--primary { background:var(--ql-accent); color:#050505; }
.ql-btn--primary:hover { background:#33ff99; box-shadow:0 0 28px rgba(0,232,123,0.28); transform:translateY(-1px); }
.ql-btn--outline { background:transparent; color:var(--ql-text); border:1px solid var(--ql-border2); }
.ql-btn--outline:hover { border-color:var(--ql-accent); color:var(--ql-accent); }
.ql-btn--lg { padding:14px 36px; font-size:0.95rem; }

/* ─── Hero ─── */
.ql-hero { position:relative; width:100%; height:100vh; min-height:680px; display:flex; align-items:center; justify-content:flex-start; padding-left:12%; overflow:hidden; }
.ql-hero__content { position:relative; z-index:2; text-align:left; max-width:560px; padding:0; opacity:0; transform:translateY(24px); transition:opacity 0.8s ease,transform 0.8s ease; }
.ql-hero__content.visible { opacity:1; transform:translateY(0); }
.ql-hero__pill { display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border-radius:var(--ql-pill); background:var(--ql-accent-dim); border:1px solid rgba(0,232,123,0.2); font-size:0.75rem; font-weight:600; color:var(--ql-accent); letter-spacing:0.04em; text-transform:uppercase; margin-bottom:24px; }
.ql-hero__pill-dot { width:6px; height:6px; border-radius:50%; background:var(--ql-accent); box-shadow:0 0 8px var(--ql-accent); animation:ql-pulse 2s ease-in-out infinite; }
.ql-hero__headline { font-family:var(--ql-sans); font-size:clamp(2.4rem,4.5vw,3.6rem); font-weight:300; line-height:1.15; color:var(--ql-white); margin-bottom:18px; letter-spacing:-0.02em; }
.ql-hero__sub { font-size:1.05rem; color:var(--ql-dim); margin-bottom:40px; font-weight:300; line-height:1.6; }
.ql-hero__scroll { position:absolute; bottom:28px; left:50%; transform:translateX(-50%); z-index:2; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:0.68rem; color:var(--ql-xdim); letter-spacing:0.08em; text-transform:uppercase; opacity:0; transition:opacity 0.8s ease 1.2s; animation:ql-float 2.5s ease-in-out infinite; }
.ql-hero__scroll.visible { opacity:1; }
@keyframes ql-float { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-6px)} }

/* ─── Signal Chips ─── */
.ql-chip { position:absolute; z-index:3; display:flex; align-items:center; gap:8px; padding:8px 14px; border-radius:var(--ql-radius-sm); backdrop-filter:blur(var(--ql-blur)); -webkit-backdrop-filter:blur(var(--ql-blur)); background:var(--ql-glass); border:1px solid var(--ql-border); font-size:0.7rem; font-weight:500; letter-spacing:0.03em; white-space:nowrap; box-shadow:0 4px 20px rgba(0,0,0,0.4); opacity:0; transition:opacity 0.6s ease,transform 0.6s ease,box-shadow var(--ql-tr); }
.ql-chip--tl { top:calc(var(--ql-navh) + 20px); left:20px; transform:translate(-16px,-8px); }
.ql-chip--tr { top:calc(var(--ql-navh) + 20px); right:20px; transform:translate(16px,-8px); }
.ql-chip--bl { bottom:72px; left:20px; transform:translate(-16px,8px); }
.ql-chip--br { bottom:72px; right:20px; transform:translate(16px,8px); }
.ql-chip.visible { opacity:1; transform:translate(0,0); }
.ql-chip:hover { transform:scale(1.04); box-shadow:0 6px 28px rgba(0,0,0,0.5); }
.ql-chip__dot { width:6px; height:6px; border-radius:50%; background:var(--ql-accent); box-shadow:0 0 8px var(--ql-accent); animation:ql-pulse 2s ease-in-out infinite; }
@keyframes ql-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
.ql-chip__label { color:var(--ql-dim); text-transform:uppercase; }
.ql-chip__value { color:var(--ql-white); font-weight:600; font-variant-numeric:tabular-nums; }
.ql-chip__delta { font-weight:600; font-variant-numeric:tabular-nums; }
.ql-chip__delta.positive { color:var(--ql-accent); }
.ql-chip__delta.negative { color:var(--ql-danger); }

/* ─── Search ─── */
.ql-search { position:relative; display:flex; align-items:center; gap:12px; max-width:540px; margin:0; padding:5px 5px 5px 18px; border-radius:var(--ql-pill); background:var(--ql-glass); backdrop-filter:blur(32px); border:1px solid var(--ql-border); box-shadow:0 8px 40px rgba(0,0,0,0.45); transition:border-color var(--ql-tr),box-shadow var(--ql-tr); }
.ql-search:focus-within { border-color:rgba(0,232,123,0.3); box-shadow:0 8px 40px rgba(0,232,123,0.06),0 0 0 1px rgba(0,232,123,0.15); }
.ql-search__icon { color:var(--ql-dim); flex-shrink:0; display:flex; }
.ql-search__input { flex:1; background:none; border:none; outline:none; color:var(--ql-white); font-size:0.88rem; caret-color:var(--ql-accent); min-width:0; font-family:var(--ql-sans); }
.ql-search__input::placeholder { color:var(--ql-dim); }
.ql-search__go { width:38px; height:38px; border-radius:50%; background:var(--ql-accent); border:none; display:flex; align-items:center; justify-content:center; color:#050505; flex-shrink:0; transition:all var(--ql-tr); text-decoration:none; }
.ql-search__go:hover { background:#33ff99; transform:scale(1.08); }

/* ─── Ticker ─── */
.ql-ticker { background:var(--ql-surface); border-top:1px solid var(--ql-border); border-bottom:1px solid var(--ql-border); padding:12px 0; overflow:hidden; position:relative; }
.ql-ticker::before,.ql-ticker::after { content:''; position:absolute; top:0; bottom:0; width:80px; z-index:2; pointer-events:none; }
.ql-ticker::before { left:0; background:linear-gradient(to right,var(--ql-surface),transparent); }
.ql-ticker::after { right:0; background:linear-gradient(to left,var(--ql-surface),transparent); }
.ql-ticker__track { display:flex; align-items:center; gap:40px; white-space:nowrap; animation:ql-scroll 40s linear infinite; width:max-content; }
.ql-ticker__track:hover { animation-play-state:paused; }
@keyframes ql-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
.ql-ticker__item { display:flex; align-items:center; gap:8px; font-size:0.76rem; font-weight:500; font-variant-numeric:tabular-nums; }
.ql-ticker__symbol { color:var(--ql-white); font-weight:700; }
.ql-ticker__price { color:var(--ql-dim); }
.ql-ticker__change { font-weight:600; }
.ql-ticker__change.up { color:var(--ql-accent); }
.ql-ticker__change.down { color:var(--ql-danger); }
.ql-ticker__placeholder { color:var(--ql-dim); font-size:0.78rem; padding:0 32px; }

/* ─── Stats ─── */
.ql-stats { padding:48px 32px; border-bottom:1px solid var(--ql-border); }
.ql-stats__inner { max-width:900px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:24px; }
.ql-stat { text-align:center; flex:1; min-width:120px; }
.ql-stat__num { display:block; font-size:2.2rem; font-weight:800; color:var(--ql-accent); letter-spacing:-0.03em; font-variant-numeric:tabular-nums; }
.ql-stat__label { display:block; font-size:0.74rem; color:var(--ql-dim); text-transform:uppercase; letter-spacing:0.08em; margin-top:4px; }
.ql-stat__divider { width:1px; height:40px; background:var(--ql-border); }

/* ─── Features ─── */
.ql-features { padding:100px 32px 80px; max-width:1200px; margin:0 auto; }
.ql-features__header { text-align:center; margin-bottom:56px; }
.ql-features__heading { font-family:var(--ql-serif); font-size:clamp(1.6rem,3.5vw,2.6rem); font-weight:400; color:var(--ql-white); margin-bottom:10px; }
.ql-features__sub { color:var(--ql-dim); font-size:0.92rem; }
.ql-features__grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:16px; }
.ql-fcard { background:var(--ql-card); backdrop-filter:blur(32px); border:1px solid var(--ql-border); border-radius:var(--ql-radius); padding:28px 24px; display:flex; flex-direction:column; transition:border-color var(--ql-tr),transform var(--ql-tr),box-shadow var(--ql-tr); }
.ql-fcard:hover { border-color:rgba(0,232,123,0.2); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.35); }
.ql-fcard__icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; background:var(--ql-accent-dim); border-radius:var(--ql-radius-sm); margin-bottom:18px; }
.ql-fcard__title { font-size:0.98rem; font-weight:600; margin-bottom:8px; color:var(--ql-white); }
.ql-fcard__desc { font-size:0.82rem; color:var(--ql-dim); line-height:1.65; flex:1; }
.ql-fcard__link { display:inline-block; margin-top:16px; font-size:0.78rem; font-weight:600; color:var(--ql-accent); text-decoration:none; transition:opacity var(--ql-tr); }
.ql-fcard__link:hover { opacity:0.8; }

/* ─── News ─── */
.ql-news { padding:80px 32px; max-width:1200px; margin:0 auto; }
.ql-news__header { text-align:center; margin-bottom:40px; }
.ql-news__heading { font-family:var(--ql-serif); font-size:clamp(1.5rem,3vw,2.2rem); font-weight:400; color:var(--ql-white); margin-bottom:8px; }
.ql-news__sub { font-size:0.88rem; color:var(--ql-dim); }
.ql-news__grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
.ql-newscard { background:var(--ql-card); border:1px solid var(--ql-border); border-radius:var(--ql-radius); padding:24px; transition:border-color var(--ql-tr),transform var(--ql-tr); display:flex; flex-direction:column; text-decoration:none; color:inherit; }
.ql-newscard:hover { border-color:rgba(0,232,123,0.15); transform:translateY(-2px); }
.ql-newscard__source { font-size:0.68rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--ql-accent); margin-bottom:10px; }
.ql-newscard__title { font-size:0.92rem; font-weight:600; color:var(--ql-white); line-height:1.4; margin-bottom:10px; flex:1; }
.ql-newscard__summary { font-size:0.78rem; color:var(--ql-dim); line-height:1.6; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.ql-newscard__time { font-size:0.68rem; color:var(--ql-xdim); }
.ql-news__placeholder { text-align:center; color:var(--ql-dim); font-size:0.85rem; padding:40px; grid-column:1/-1; }
.ql-news__more { text-align:center; margin-top:32px; }

/* ─── CTA ─── */
.ql-cta { padding:100px 32px; text-align:center; position:relative; overflow:hidden; }
.ql-cta__inner { position:relative; z-index:1; }
.ql-cta__heading { font-family:var(--ql-serif); font-size:clamp(1.6rem,4vw,2.8rem); font-weight:400; color:var(--ql-white); margin-bottom:12px; }
.ql-cta__sub { color:var(--ql-dim); font-size:0.95rem; margin-bottom:32px; }

/* ─── Footer ─── */
.ql-footer { border-top:1px solid var(--ql-border); padding:40px 32px 0; }
.ql-footer__inner { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; flex-wrap:wrap; gap:32px; padding-bottom:32px; }
.ql-footer__left { max-width:260px; }
.ql-footer__brand { font-weight:800; font-size:1.1rem; color:var(--ql-white); letter-spacing:-0.03em; }
.ql-footer__tagline { font-size:0.78rem; color:var(--ql-dim); margin-top:6px; }
.ql-footer__cols { display:flex; gap:48px; }
.ql-footer__col { display:flex; flex-direction:column; gap:8px; }
.ql-footer__col-title { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ql-dim); margin-bottom:4px; }
.ql-footer__col a { font-size:0.82rem; color:var(--ql-dim); transition:color var(--ql-tr); text-decoration:none; }
.ql-footer__col a:hover { color:var(--ql-accent); }
.ql-footer__bottom { border-top:1px solid var(--ql-border); padding:20px 0; max-width:1200px; margin:0 auto; }
.ql-footer__bottom span { font-size:0.72rem; color:var(--ql-xdim); }

/* ─── Responsive ─── */
@media(max-width:768px) {
  .ql-nav__links { display:none; }
  .ql-nav__inner { padding:0 16px; }
  .ql-hero__headline { font-size:clamp(2rem,8vw,2.4rem); }
  .ql-chip { font-size:0.62rem; padding:6px 10px; }
  .ql-chip--tl,.ql-chip--bl { left:10px; }
  .ql-chip--tr,.ql-chip--br { right:10px; }
  .ql-features { padding:72px 16px 60px; }
  .ql-features__grid { grid-template-columns:1fr; }
  .ql-news { padding:60px 16px; }
  .ql-news__grid { grid-template-columns:1fr; }
  .ql-stats__inner { flex-direction:column; gap:16px; }
  .ql-stat__divider { width:40px; height:1px; }
  .ql-footer__inner { flex-direction:column; }
}
@media(max-width:480px) {
  .ql-chip--tr,.ql-chip--br { display:none; }
  .ql-search { max-width:100%; }
  .ql-cta { padding:60px 16px; }
}
`;
