import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Allow responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are the "Vertex Portfolio Intelligence Engine." Your goal is to process user investment data (CSV or manual text) and provide structured financial analysis.

### Data Handling Rules:
1. Parse stock tickers, quantities, and purchase prices.
2. Calculate the weighted average cost for each holding.
3. If multiple stocks exist, calculate the total portfolio value and the allocation percentage for each.
4. Provide a "Portfolio Health Score" (1-100) based on diversification.

### Output Requirements:
- Return a JSON object exactly matching the requested schema.
- Include a summary of 'Top Performer' and 'Biggest Drag'.
- Generate a 3-sentence narrative explaining the current market sentiment for these specific holdings.

### Constraints:
- Use only the data provided; do not hallucinate missing purchase dates.
- If a ticker is unrecognized, flag it in the "errors" field of the JSON.
`;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Step 1: Fetch portfolios
    const { data: rawHoldings, error: holdingsErr } = await supabase
      .from("portfolios")
      .select("stock_id, quantity, buy_price")
      .eq("user_id", user.id);

    if (holdingsErr) throw holdingsErr;

    if (!rawHoldings || rawHoldings.length === 0) {
      return new Response(JSON.stringify({ error: "Empty portfolio" }), { status: 200 });
    }

    // Step 2: Fetch stocks
    const stockIds = Array.from(new Set(rawHoldings.map(h => h.stock_id)));
    const { data: stocks, error: stocksErr } = await supabase
      .from("stocks")
      .select("id, symbol, name, price")
      .in("id", stockIds);

    if (stocksErr) throw stocksErr;

    const stockMap = new Map(stocks?.map(s => [s.id, s]) || []);

    const portfolioContext = rawHoldings.map((h: any) => {
        const s = stockMap.get(h.stock_id);
        if (!s) return null;
        return {
          symbol: s.symbol,
          name: s.name,
          quantity: h.quantity,
          buyPrice: h.buy_price,
          currentPrice: s.price || 'N/A'
        };
      }).filter(Boolean);

    const dynamicSystemPrompt = `
${SYSTEM_PROMPT}

## USER PORTFOLIO DATA
\`\`\`json
${JSON.stringify(portfolioContext, null, 2)}
\`\`\`
Analyze this data and produce the requested JSON output.
`;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      system: dynamicSystemPrompt,
      prompt: "Analyze the current portfolio data and generate the structured JSON report.",
      schema: z.object({
        totalPortfolioValue: z.number().describe("The total estimated value of the current portfolio."),
        healthScore: z.number().min(1).max(100).describe("Portfolio Health Score (1-100) based on diversification and performance."),
        topPerformer: z.object({
          symbol: z.string(),
          name: z.string(),
          performancePercentage: z.number().describe("Percentage gain of this holding."),
          reason: z.string().describe("Short reason why it's the top performer.")
        }).nullable(),
        biggestDrag: z.object({
          symbol: z.string(),
          name: z.string(),
          performancePercentage: z.number().describe("Percentage loss or lowest gain."),
          reason: z.string().describe("Short reason why it's dragging the portfolio down.")
        }).nullable(),
        marketNarrative: z.string().describe("A 3-sentence narrative explaining the current market sentiment for these specific holdings."),
        holdingsAnalysis: z.array(z.object({
          symbol: z.string(),
          weightedAverageCost: z.number(),
          allocationPercentage: z.number()
        })).describe("Breakdown of each holding's calculated metrics."),
        errors: z.array(z.string()).describe("List of unrecognized tickers or data inconsistencies, if any.")
      }),
    });

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in quNTR Intelligence Engine:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate analysis.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
