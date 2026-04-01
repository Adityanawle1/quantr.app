# QUANTR
### Invest with Precision

Quantr is India's precision-built financial research platform for serious equity investors. It combines a Bloomberg-grade stock screener, deep company fundamentals, AI-powered portfolio analysis, and a personal portfolio tracker — in a clean, fast, mobile-first interface built specifically for the Indian market (NSE/BSE).

---

## Overview

The Indian retail investor market is growing at an unprecedented pace. Yet the tools available remain either too simplistic or too cluttered. Quantr fills that gap. It is built for the investor who researches before buying, runs screeners, reads financial statements, and wants one platform that does it all — without the noise.

---

## Features

### Stock Screener
Filter the entire NSE/BSE universe across 20+ fundamental and price metrics including valuation, profitability, leverage, growth, dividends, and quality indicators. Save and share screener presets via unique URL. Results render as a sortable, paginated table with configurable columns.

### Company Intelligence
Every listed company has a dedicated page with six focused tabs — Overview, Financials (5Y annual + 8Q quarterly), Ratios with 5-year sparklines, Peer Comparison, Shareholding pattern, and an interactive Price Chart with OHLCV data and moving averages.

### Portfolio Tracker
Add transactions with symbol, quantity, buy price, and date. Quantr calculates weighted average cost basis, unrealised P&L, XIRR returns, and day change impact across all holdings. Visualised through allocation charts by stock, sector, and market cap band.

### Portfolio GPT
An AI-powered portfolio analyst built into Quantr. Ask questions about your portfolio in plain English — sector concentration, risk exposure, return attribution, and benchmark comparisons. Powered by the Anthropic Claude API.

### Market Intelligence Dashboard
Live Nifty 50, Sensex, Bank Nifty, and Nifty IT tiles with intraday sparklines. Sector heatmap colour-coded by percentage change. Top gainers and losers, 52-week high/low breakers, and most viewed companies on Quantr — all in one view.

### Watchlist
Track stocks across devices and sessions with live price, day change, and 52-week range bar per stock. One-click navigation to the full company page.

### Global Search
Instant autocomplete after two characters. Search by symbol, company name, or sector. Fully keyboard navigable with a full-screen overlay on mobile.

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

## Database

Quantr uses PostgreSQL (hosted on Supabase) with Prisma ORM. The schema covers users, stocks master list, daily OHLCV prices, financial statements, pre-calculated ratios, shareholding patterns, portfolio holdings, watchlist, and screener presets. Live prices are fetched from external APIs every 3 minutes during market hours and cached in the database for performance.

---

## Project Structure
```
vertex.app/
├── app/                  Next.js App Router pages
│   ├── (dashboard)/      Dashboard and market overview
│   ├── stocks/[symbol]/  Company intelligence pages
│   ├── portfolio/        Portfolio tracker
│   ├── screener/         Stock screener
│   └── api/              Internal API routes
├── components/           Reusable UI components
├── lib/                  Utility functions and DB client
├── prisma/               Database schema and migrations
├── store/                Zustand state management
├── hooks/                Custom React hooks
├── scripts/              Data ingestion and cron scripts
└── public/               Static assets
```

---

## Getting Started
```bash
git clone https://github.com/Adityanawle1/vertex.app.git
cd vertex.app
npm install
```

Create a `.env.local` file in the root with the following variables:
```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=
YAHOO_FINANCE_API_KEY=
POLYGON_API_KEY=
SENTRY_DSN=
```

Then run the database migrations and start the development server:
```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/screener` | POST | Run filter query, return paginated results |
| `/api/company/[symbol]` | GET | Full company data bundle |
| `/api/company/[symbol]/chart` | GET | OHLCV data for price chart |
| `/api/portfolio` | GET POST DELETE | User holdings CRUD |
| `/api/watchlist` | GET POST DELETE | User watchlist CRUD |
| `/api/search` | GET | Autocomplete search results |
| `/api/market` | GET | Indices, movers, heatmap data |
| `/api/screener/presets` | GET POST | Save and load screener presets |
| `/api/portfolio-gpt` | POST | AI portfolio analysis |


*Quantr is private and confidential. All rights reserved © 2026 Quantr.*

