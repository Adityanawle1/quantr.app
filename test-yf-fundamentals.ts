import YahooFinance from 'yahoo-finance2';
const yahooFinance = new (YahooFinance as any)();

async function test() {
  try {
    console.log("Fetching quoteSummary for RELIANCE.NS...");
    const quoteSummary = await yahooFinance.quoteSummary('RELIANCE.NS', {
      modules: ['majorHoldersBreakdown', 'balanceSheetHistory', 'incomeStatementHistory', 'balanceSheetHistoryQuarterly']
    });
    
    console.log("\n--- Major Holders ---");
    console.dir(quoteSummary.majorHoldersBreakdown, { depth: null });

    console.log("\n--- Balance Sheet (Annual) ---");
    if (quoteSummary.balanceSheetHistory?.balanceSheetStatements) {
      console.dir(quoteSummary.balanceSheetHistory.balanceSheetStatements[0], { depth: 1 });
    }

    console.log("\n--- Balance Sheet (Quarterly) ---");
     if (quoteSummary.balanceSheetHistoryQuarterly?.balanceSheetStatements) {
      console.dir(quoteSummary.balanceSheetHistoryQuarterly.balanceSheetStatements[0], { depth: 1 });
    }
  } catch (err) {
    console.error(err);
  }
}

test();
