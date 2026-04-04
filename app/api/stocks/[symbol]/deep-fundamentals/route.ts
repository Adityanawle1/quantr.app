import { NextResponse } from "next/server";
import { yahooFinance, toNSESymbol } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

// Helper: convert raw value (in units) to Crores
function toCr(val: number | null | undefined): number | null {
  if (val == null || isNaN(val)) return null;
  return parseFloat((val / 1e7).toFixed(2));
}

function safeNum(val: unknown): number | null {
  if (val == null) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const nsSymbol = toNSESymbol(symbol.toUpperCase());

    const result = await (yahooFinance as any).quoteSummary(nsSymbol, {
      modules: [
        "incomeStatementHistory",
        "incomeStatementHistoryQuarterly",
        "balanceSheetHistory",
        "defaultKeyStatistics",
        "financialData",
      ],
    });

    // ── Annual Income Statement (P&L) ─────────────────────
    const annualIS: any[] =
      result?.incomeStatementHistory?.incomeStatementHistory || [];
    const profitAndLoss = annualIS.map((s: any) => {
      const revenue = safeNum(s.totalRevenue);
      const grossProfit = safeNum(s.grossProfit);
      const ebit = safeNum(s.ebit);
      const netIncome = safeNum(s.netIncome);
      const taxExpense = safeNum(s.incomeTaxExpense);
      const interest = safeNum(s.interestExpense);
      const depreciation = safeNum(s.depreciation);
      const otherIncome = safeNum(s.totalOtherIncomeExpenseNet);
      const incomeBT = safeNum(s.incomeBeforeTax);

      // Calculate operating expenditure = Revenue - Operating Profit (EBIT)
      const opEx =
        revenue != null && ebit != null
          ? parseFloat((revenue - ebit).toFixed(2))
          : null;

      return {
        period: s.endDate
          ? new Date(s.endDate).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })
          : "—",
        netSales: toCr(revenue),
        totalExpenditure: toCr(opEx),
        operatingProfit: toCr(ebit || grossProfit),
        otherIncome: toCr(otherIncome),
        interest: interest != null ? toCr(Math.abs(interest)) : null,
        depreciation: toCr(depreciation),
        profitBeforeTax: toCr(incomeBT),
        tax: toCr(taxExpense),
        netProfit: toCr(netIncome),
        eps: s.basicEPS != null ? parseFloat(Number(s.basicEPS).toFixed(2)) : null,
      };
    });

    // ── Quarterly Income Statement ────────────────────────
    const quarterlyIS: any[] =
      result?.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
    const quarterly = quarterlyIS.map((s: any) => {
      const revenue = safeNum(s.totalRevenue);
      const ebit = safeNum(s.ebit);
      const grossProfit = safeNum(s.grossProfit);
      const netIncome = safeNum(s.netIncome);
      const taxExpense = safeNum(s.incomeTaxExpense);
      const interest = safeNum(s.interestExpense);
      const depreciation = safeNum(s.depreciation);
      const otherIncome = safeNum(s.totalOtherIncomeExpenseNet);
      const incomeBT = safeNum(s.incomeBeforeTax);
      const opEx =
        revenue != null && ebit != null
          ? parseFloat((revenue - ebit).toFixed(2))
          : null;

      return {
        period: s.endDate
          ? new Date(s.endDate).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })
          : "—",
        netSales: toCr(revenue),
        totalExpenditure: toCr(opEx),
        operatingProfit: toCr(ebit || grossProfit),
        otherIncome: toCr(otherIncome),
        interest: interest != null ? toCr(Math.abs(interest)) : null,
        depreciation: toCr(depreciation),
        profitBeforeTax: toCr(incomeBT),
        tax: toCr(taxExpense),
        netProfit: toCr(netIncome),
        eps: s.basicEPS != null ? parseFloat(Number(s.basicEPS).toFixed(2)) : null,
      };
    });

    // ── Balance Sheet from available fields ───────────────
    // Yahoo Finance free tier doesn't return historical BS for Indian stocks,
    // so we use the most recent snapshot from defaultKeyStatistics & financialData
    const ks: any = result?.defaultKeyStatistics || {};
    const fd: any = result?.financialData || {};

    const balanceSheetSnapshot = {
      period: "Latest",
      shareCapital: null as number | null,
      totalReserves: toCr(safeNum(ks.bookValue) != null && safeNum(ks.sharesOutstanding) != null
        ? safeNum(ks.bookValue)! * safeNum(ks.sharesOutstanding)!
        : null),
      borrowings: toCr(safeNum(fd.totalDebt)),
      currentLiabilities: toCr(safeNum(fd.currentRatio) != null && safeNum(fd.totalCurrentAssets) != null
        ? safeNum(fd.totalCurrentAssets)! / safeNum(fd.currentRatio)!
        : null),
      totalLiabilities: null as number | null,
      netBlock: null as number | null,
      investments: toCr(safeNum(fd.operatingCashflow)),
      currentAssets: toCr(safeNum(fd.totalCashPerShare) != null && safeNum(ks.sharesOutstanding) != null
        ? safeNum(fd.totalCashPerShare)! * safeNum(ks.sharesOutstanding)!
        : null),
      totalAssets: toCr(
        safeNum(ks.enterpriseValue)
      ),
    };

    // Also try annual balance sheet statements even if most fields are empty
    const annualBS: any[] =
      result?.balanceSheetHistory?.balanceSheetStatements || [];

    const balanceSheet = annualBS.length > 0
      ? annualBS.map((s: any) => {
          const totalAssets = safeNum(s.totalAssets);
          const totalLiab = safeNum(s.totalLiab);
          const totalCurrentAssets = safeNum(s.totalCurrentAssets);
          const totalCurrentLiab = safeNum(s.totalCurrentLiabilities);
          const longTermDebt = safeNum(s.longTermDebt);
          const shortTermDebt = safeNum(s.shortLongTermDebt);
          const ppe = safeNum(s.propertyPlantEquipmentNet) ?? safeNum(s.propertyPlantEquipment);
          const ltInv = safeNum(s.longTermInvestments);
          const commonStock = safeNum(s.commonStock);
          const retainedEarnings = safeNum(s.retainedEarnings);
          const totalStockholderEquity = safeNum(s.totalStockholderEquity);

          return {
            period: s.endDate
              ? new Date(s.endDate).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })
              : "—",
            shareCapital: toCr(commonStock),
            totalReserves: toCr(retainedEarnings ?? totalStockholderEquity),
            borrowings: toCr(longTermDebt ?? shortTermDebt),
            currentLiabilities: toCr(totalCurrentLiab),
            totalLiabilities: toCr(totalLiab),
            netBlock: toCr(ppe),
            investments: toCr(ltInv),
            currentAssets: toCr(totalCurrentAssets),
            totalAssets: toCr(totalAssets),
          };
        })
      : [balanceSheetSnapshot];

    return NextResponse.json({ quarterly, profitAndLoss, balanceSheet });
  } catch (error: any) {
    console.error(`[api/stocks/deep-fundamentals] Error:`, error.message);
    return NextResponse.json(
      {
        error: "Could not fetch fundamental data",
        quarterly: [],
        profitAndLoss: [],
        balanceSheet: [],
      },
      { status: 500 }
    );
  }
}
