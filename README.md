# QUANTR — Invest with Precision

> India's precision-built financial research platform for serious investors.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?style=flat-square&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## What is Quantr?

Quantr is a quantitative research and portfolio intelligence platform built for the modern Indian investor. Whether you manage ₹5 lakhs or ₹5 crores, Quantr gives you the same quality of financial intelligence that institutional desks have had for decades — in a clean, fast, mobile-first interface.

**No ads. No noise. Just precision.**

---

## Live Demo

🔗 [quantr.in](https://github.com/Adityanawle1/vertex.app)

---

## Core Features

### 📊 Quantr Screener
Filter the entire NSE/BSE universe across 20+ fundamental and price metrics.
- Valuation filters — P/E, P/B, EV/EBITDA, Market Cap
- Profitability — ROE, ROCE, Net Margin, EBITDA Margin
- Leverage — Debt to Equity, Interest Coverage
- Growth — Revenue, Profit, EPS growth YoY
- Quality — Promoter holding, FII holding
- Save and share screener presets via unique URL

### 🏢 Company Intelligence
Deep dive into any NSE/BSE listed company at `/stocks/[symbol]`
- Overview — CMP, market cap, 52W range, key stats
- Financials — 5Y annual + 8Q quarterly (Income, Balance Sheet, Cash Flow)
- Ratios — 20+ ratios with 5-year trend sparklines
- Peers — Auto-generated side-by-side peer comparison
- Shareholding — Promoter/FII/DII/Public quarterly breakdown
- Price Chart — Interactive OHLCV with SMA 20/50/200

### 💼 Portfolio Intelligence
Personal portfolio tracker with real-time P&L.
- Add transactions — symbol, quantity, buy price, buy date
- Weighted average cost basis across multiple transactions
- Unrealised P&L, XIRR calculation, day change impact
- Allocation pie chart — by stock, sector, market cap band
- Sector concentration risk indicator
- Portfolio value timeline from first transaction

### ⭐ Watchlist
- Track stocks across devices and sessions
- 52W range bar, day change %, market cap per stock
- One-click to full company page

### 🏠 Market Intelligence Dashboard
- Nifty 50, Sensex, Bank Nifty live tiles with intraday sparklines
- Sector heatmap — colour-coded by % change
- Top gainers and losers for the session
- 52-week high/low breakers
- Most viewed companies on Quantr today
- Market status banner (Pre-market / Live / Closed)

### 🤖 Portfolio GPT *(New)*
AI-powered portfolio analyst built into Quantr.
- Ask questions about your portfolio in plain English
- Get insights on sector concentration, risk exposure, return attribution
- Compare your holdings against benchmarks
- Powered by Claude AI (Anthropic)

### 🔍 Global Search
- Instant autocomplete after 2 characters
- Search by symbol, company name, sector
- Keyboard navigable — arrow keys + Enter
- Mobile: full-screen overlay with recent searches

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router + SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn/UI |
| Data Visualisation | Recharts + TradingView Lightweight Charts |
| State Management | Zustand |
| Auth | NextAuth.js |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Cache | Redis via Upstash |
| Validation | Zod |
| AI | Anthropic Claude API |
| Background Jobs | Vercel Cron / Inngest |
| Hosting | Vercel |
| Analytics | Vercel Analytics + PostHog |
| Error Monitoring | Sentry |

---

## Database Schema
```
users             → Auth + subscription tier
stocks            → Master list of all NSE/BSE companies
prices            → Daily OHLCV, refreshed every 3 mins during market hours
financials        → Income statement, balance sheet, cash flow
ratios            → PE, ROE, ROCE, D/E, EPS — pre-calculated
shareholding      → Promoter/FII/DII quarterly breakdown
portfolio         → User holdings (linked to users)
watchlist         → User saved stocks (linked to users)
screener_presets  → Saved filter queries (public + private)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- npm or yarn

### Installation
```bash
# Clone the repo
git clone https://github.com/Adityanawle1/vertex.app.git

# Go into the project
cd vertex.app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your keys (see Environment Variables section below)

# Set up the database
npx prisma migrate dev

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the root of the project with the following:
```env
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Financial Data APIs
YAHOO_FINANCE_API_KEY=
POLYGON_API_KEY=
ALPHA_VANTAGE_API_KEY=

# AI
ANTHROPIC_API_KEY=

# Monitoring
SENTRY_DSN=
```

> ⚠️ Never commit your `.env` file to GitHub. It is already listed in `.gitignore`.

---

## Project Structure
```
vertex.app/
├── app/                  # Next.js App Router pages
│   ├── (dashboard)/      # Dashboard layout
│   ├── stocks/[symbol]/  # Company intelligence pages
│   ├── portfolio/        # Portfolio tracker
│   ├── screener/         # Stock screener
│   └── api/              # API routes
├── components/           # Reusable UI components
├── lib/                  # Utility functions, DB client
├── prisma/               # Database schema and migrations
├── store/                # Zustand state management
├── hooks/                # Custom React hooks
├── scripts/              # Data ingestion scripts
└── public/               # Static assets
```

---

## API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/screener` | POST | Run filter query, return paginated results |
| `/api/company/[symbol]` | GET | Full company data bundle |
| `/api/company/[symbol]/chart` | GET | OHLCV data for price chart |
| `/api/portfolio` | GET / POST / DELETE | User holdings CRUD |
| `/api/watchlist` | GET / POST / DELETE | User watchlist CRUD |
| `/api/search` | GET `?q=` | Autocomplete search results |
| `/api/market` | GET | Indices, movers, heatmap data |
| `/api/screener/presets` | GET / POST | Save / load screener presets |
| `/api/portfolio-gpt` | POST | AI portfolio analysis |

---

## Monetisation

| Tier | Price | Features |
|---|---|---|
| Free | ₹0 | Screener (5 filters), company pages, watchlist (10 stocks) |
| Quantr Pro | ₹499/mo or ₹3,999/yr | Unlimited screener, portfolio tracker, saved presets, CSV export |
| Quantr Elite | ₹1,499/mo | Everything + API access, multi-portfolio, Portfolio GPT, advanced analytics |

---

## Roadmap

- [x] Market Intelligence Dashboard
- [x] Stock Screener (20+ filters)
- [x] Company Intelligence Pages
- [x] Portfolio Tracker with P&L
- [x] Watchlist
- [x] Global Search
- [x] Portfolio GPT (AI analyst)
- [ ] Earnings alert engine
- [ ] Quantr Score (proprietary quality score)
- [ ] Backtesting engine
- [ ] Technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Mutual fund overlap analyser
- [ ] Mobile app (React Native)
- [ ] Public screener marketplace
- [ ] International equities (NYSE/NASDAQ)



## License

This project is private and confidential. All rights reserved © 2026 Quantr.

---

<p align="center">
  Built with precision for India's serious investors.
  <br/>
  <strong>Q<span>UANTR</span> — Invest with Precision.</strong>
</p>
