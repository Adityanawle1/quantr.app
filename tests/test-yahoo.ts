import yf from "yahoo-finance2";
const yahooFinance = (yf as any).default || yf;

async function main() {
  const ySymbol = "TATAMOTORS.NS";
  console.log(`Fetching data for ${ySymbol}...`);
  
  try {
    const quote = await yahooFinance.quoteSummary(ySymbol, {
      modules: ["summaryDetail", "financialData", "summaryProfile", "price", "defaultKeyStatistics"],
    }) as any;

    console.log({
      ev: quote.defaultKeyStatistics?.enterpriseValue,
      bookValue: quote.defaultKeyStatistics?.bookValue,
      cash: quote.financialData?.totalCash,
      debt: quote.financialData?.totalDebt,
      promoterHolding: quote.defaultKeyStatistics?.heldPercentInsiders,
      eps: quote.defaultKeyStatistics?.trailingEps || quote.summaryDetail?.trailingEps,
      divYield: quote.summaryDetail?.dividendYield,
      roe: quote.financialData?.returnOnEquity,
      roce: quote.financialData?.returnOnAssets,
      debtToEquity: quote.financialData?.debtToEquity ? quote.financialData.debtToEquity / 100 : null,
      salesGrowth: quote.financialData?.revenueGrowth,
    });
  } catch (err: any) {
    console.error("Yahoo Error:", err.message);
  }
}

main().catch(console.error);
