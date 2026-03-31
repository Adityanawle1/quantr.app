CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "nsSymbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "industry" TEXT,
    "marketCapType" TEXT NOT NULL,
    "exchange" TEXT NOT NULL DEFAULT 'NSE',
    "isin" TEXT,
    "lastSynced" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION,
    "market_cap" DOUBLE PRECISION,
    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stocks_symbol_key" ON "stocks"("symbol");
CREATE UNIQUE INDEX "stocks_nsSymbol_key" ON "stocks"("nsSymbol");
CREATE UNIQUE INDEX "stocks_isin_key" ON "stocks"("isin");

CREATE TABLE "financials" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "current_price" DOUBLE PRECISION,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "previous_close" DOUBLE PRECISION,
    "change" DOUBLE PRECISION,
    "change_percent" DOUBLE PRECISION,
    "volume" BIGINT,
    "avg_volume" BIGINT,
    "week_high_52" DOUBLE PRECISION,
    "week_low_52" DOUBLE PRECISION,
    "pe_ratio" DOUBLE PRECISION,
    "pb_ratio" DOUBLE PRECISION,
    "ps_ratio" DOUBLE PRECISION,
    "ev_ebitda" DOUBLE PRECISION,
    "dividend_yield" DOUBLE PRECISION,
    "eps" DOUBLE PRECISION,
    "book_value" DOUBLE PRECISION,
    "market_cap" BIGINT,
    "roe" DOUBLE PRECISION,
    "roce" DOUBLE PRECISION,
    "roa" DOUBLE PRECISION,
    "debt_to_equity" DOUBLE PRECISION,
    "current_ratio" DOUBLE PRECISION,
    "interest_coverage" DOUBLE PRECISION,
    "revenue_growth_yoy" DOUBLE PRECISION,
    "profit_growth_yoy" DOUBLE PRECISION,
    "rev_cagr_3y" DOUBLE PRECISION,
    "promoter_holding" DOUBLE PRECISION,
    "fii_holding" DOUBLE PRECISION,
    "dii_holding" DOUBLE PRECISION,
    "public_holding" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "financials_stock_id_key" ON "financials"("stock_id");
ALTER TABLE "financials" ADD CONSTRAINT "financials_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "buy_price" DOUBLE PRECISION NOT NULL,
    "buy_date" TIMESTAMP(3),
    "exchange" TEXT NOT NULL DEFAULT 'NSE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);
