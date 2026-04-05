-- ============================================================
-- RLS FIX SCRIPT for Quantr / Vertex App
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- OPTION A: DISABLE RLS ENTIRELY (simplest fix, use if app
-- uses service_role key server-side only — which it does via
-- Prisma + direct connection)
-- ============================================================

ALTER TABLE public."User"        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Stock"       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Financials"  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Portfolio"   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Alert"       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Preset"      DISABLE ROW LEVEL SECURITY;

-- Also disable on lowercase versions if they exist
ALTER TABLE IF EXISTS public.users       DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stocks      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financials  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolios  DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Done! Your app should work normally again.
-- ============================================================
