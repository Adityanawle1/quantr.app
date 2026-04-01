# QUANTR
### Invest with Precision

Quantr is a quantitative financial research and portfolio intelligence platform built for the modern Indian equity investor. It gives every serious investor access to the same quality of financial data and analysis that institutional desks have had for decades — presented in a clean, fast, and distraction-free interface.

Built specifically for the Indian market. NSE and BSE listed equities. No ads. No noise.

---

## The Problem

The Indian retail investor market crossed 13 crore demat accounts in 2024, yet the research tools available are either too shallow for serious investors or too cluttered with ads and irrelevant content. No platform combines a powerful stock screener, deep company fundamentals, and a personal portfolio tracker in one clean product built for the modern investor.

Quantr is that platform.

---

## Features

### Stock Screener
Filter the entire NSE/BSE universe across 20+ fundamental and price metrics. Valuation, profitability, leverage, growth, dividend, and quality filters — all combinable. Results render as a sortable, paginated table with configurable columns. Screener presets can be saved and shared via a unique URL.

### Company Intelligence
Every listed company has a dedicated research page covering six areas — a key stats overview, five-year financial statements (income, balance sheet, cash flow), ratio history with trend sparklines, auto-generated peer comparison, shareholding pattern breakdown by quarter, and an interactive OHLCV price chart with moving averages.

### Portfolio Tracker
Tracks a personal investment portfolio with full transaction history. Calculates weighted average cost basis, unrealised P&L, XIRR returns, and day change impact. Portfolio analytics include allocation breakdown by stock, sector, and market cap band — with a sector concentration risk indicator.

### Portfolio GPT
An AI-powered analyst built into the portfolio layer. Answers plain-English questions about your holdings — sector exposure, risk concentration, return attribution, and benchmark comparisons. Powered by the Anthropic Claude API.

### Market Dashboard
A live market overview showing Nifty 50, Sensex, Bank Nifty, and Nifty IT with intraday sparklines. Includes a sector heatmap colour-coded by percentage change, top session gainers and losers, 52-week high and low breakers, and the most viewed stocks on Quantr.

### Watchlist
Persistent stock watchlist across devices and sessions. Shows live price, day change percentage, and 52-week range position per stock.

### Global Search
Instant autocomplete across all NSE/BSE listed companies. Searchable by symbol, company name, or sector. Fully keyboard navigable.

---

## How It Is Built

Quantr is a server-side rendered web application built on Next.js 14 using the App Router. All pages that need to rank on search engines, particularly the company intelligence pages, are fully server-side rendered with dynamic meta tags and structured data for SEO.

Financial data comes from external APIs (Yahoo Finance, Polygon.io, Alpha Vantage) and is ingested into a PostgreSQL database on a scheduled cron job. Live prices refresh every three minutes during market hours. Fundamental data updates daily. All frontend data is served through internal Next.js API routes : the client never talks directly to the database.

The screener runs parameterised SQL queries against the database, making it fast and scalable across the full NSE/BSE universe. User data ; portfolios, watchlists, and screener presets is stored persistently in PostgreSQL and tied to authenticated sessions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router + SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn/UI |
| Charts | Recharts + TradingView Lightweight Charts |
| State Management | Zustand |
| Authentication | NextAuth.js |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Cache | Redis via Upstash |
| Validation | Zod |
| AI | Anthropic Claude API |
| Background Jobs | Vercel Cron / Inngest |
| Hosting | Vercel Edge Network |
| Analytics | Vercel Analytics + PostHog |
| Error Monitoring | Sentry |

---

## Data Architecture
```
External APIs (Yahoo Finance, Polygon, Alpha Vantage)
                        ↓
              Cron job every 3 minutes
                        ↓
              PostgreSQL via Supabase
                        ↓
          Next.js internal API routes
                        ↓
                  Frontend UI
```

The database stores the full company master list, daily OHLCV price history, financial statements, pre-calculated ratios, shareholding patterns, user portfolios, watchlists, and screener presets. Live prices are never fetched directly on page load — they are always served from the database cache for performance and reliability.

---

## Performance Targets

| Metric | Target |
|---|---|
| Largest Contentful Paint | Under 2.5 seconds |
| Time to First Byte | Under 400ms |
| Price data freshness | Maximum 3 minutes stale during market hours |
| Screener query time | Under 500ms for full NSE/BSE universe |
| Uptime | 99.5% (Vercel SLA) |

---

## Roadmap

**Shipped**
Stock screener, company intelligence pages, portfolio tracker with XIRR, watchlist, market dashboard, global search, Portfolio GPT

**In Progress**
Earnings alert engine, Quantr Score (proprietary quality composite), news sentiment feed

**Planned**
Backtesting engine, technical indicators (RSI, MACD, Bollinger Bands), mutual fund overlap analyser, mobile app (React Native), public screener marketplace, international equities (NYSE/NASDAQ)

---

*India's precision-built financial research platform. © 2026 Quantr.*
