import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import yahooFinance from 'yahoo-finance2';
import { prisma } from '@/lib/prisma';
import { DEMO_USER_ID } from '@/lib/auth-mock';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are PortfolioGPT, an advanced portfolio analysis assistant embedded in a financial portfolio tracking platform (Quantr). You help users understand their investment portfolio performance, identify patterns, and receive data-driven insights. 

You are NOT a licensed financial advisor. All your outputs are educational, analytical, and based solely on user-provided data.

---

## Core Features & Capabilities
1. Portfolio Input & Management
2. Portfolio Overview & Dashboard
3. Deep Analysis Engine
4. Pattern Recognition & Behavioral Insights
5. AI Suggestions Engine
6. Loss & Mistake Analysis
7. Predictive Modeling
8. Reporting & Export

### Tone & Style
- Be clear, concise, and data-focused
- Use tables, bullet points, and structured layouts for readability
- Use plain English — avoid excessive financial jargon without explanation
- Be encouraging but honest — don't sugarcoat poor performance
- Only analyze data explicitly provided by the user. Do not guarantee future results.

## ⚠️ MANDATORY DISCLAIMER
Append this disclaimer to EVERY response that contains suggestions, predictions, or recommendations:
> ---
> *⚠️ Important Disclaimer*
> 
> The analysis, suggestions, and projections provided are generated purely based on the portfolio data you have shared. This is *not financial advice* and should *not* be treated as a substitute for professional financial consultation. Past performance does not guarantee future results. Markets are inherently unpredictable, and all investments carry risk. Please consult a qualified financial advisor before making any investment decisions. The platform and its AI assistant bear no responsibility for any financial losses incurred based on these insights.
> ---
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Fetch user portfolio context
    const holdings = await prisma.portfolio.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        stock: {
          include: { financials: true }
        }
      }
    });

    // Token limit protection for extremely large portfolios
    const MAX_HOLDINGS = 50;
    const isLargePortfolio = holdings.length > MAX_HOLDINGS;

    const portfolioContext = holdings.length > 0 ? 
      holdings.slice(0, MAX_HOLDINGS).map(h => ({
        symbol: h.stock.symbol,
        name: h.stock.name,
        sector: h.stock.sector,
        quantity: h.quantity,
        avgBuyPrice: h.buyPrice,
        currentPrice: h.stock.financials?.currentPrice || 'N/A'
      })) 
      : "User has an empty portfolio.";

    const limitWarning = isLargePortfolio ? 
      "\nNote: The user's portfolio exceeds 50 items. Only the top 50 holdings have been provided to conserve context window." : "";

    const dynamicSystemPrompt = `
${SYSTEM_PROMPT}

## USER PORTFOLIO CONTEXT
Below is the user's current portfolio data:
\`\`\`json
${JSON.stringify(portfolioContext, null, 2)}
\`\`\`${limitWarning}
Use this data to answer their questions accurately and provide insights.
`;

    const result = streamText({
      model: google('gemini-1.5-flash'), // Gemini is free!
      system: dynamicSystemPrompt,
      messages,
      tools: {
        getRealTimeStockQuote: tool({
          description: 'Fetch real-time stock price and key financial metrics for a given ticker symbol from Yahoo Finance.',
          parameters: z.object({
            symbol: z.string().describe('The stock ticker symbol (e.g., RELIANCE.NS, AAPL, TCS.NS)'),
          }),
          execute: async ({ symbol }) => {
            try {
              const quote = await yahooFinance.quote(symbol);
              return {
                symbol: quote.symbol,
                price: quote.regularMarketPrice,
                change: quote.regularMarketChangePercent,
                peRatio: quote.trailingPE,
                marketCap: quote.marketCap,
              };
            } catch (e: any) {
              return { error: `Could not fetch quote for ${symbol}: ${e.message}` };
            }
          },
        }),
        calculateCAGR: tool({
          description: 'Calculate the Compound Annual Growth Rate (CAGR) for an investment.',
          parameters: z.object({
            beginningValue: z.number().describe('The initial investment amount.'),
            endingValue: z.number().describe('The final investment value.'),
            years: z.number().describe('The number of years the investment was held.'),
          }),
          execute: async ({ beginningValue, endingValue, years }) => {
            if (years <= 0 || beginningValue <= 0) return { error: "Invalid inputs for CAGR" };
            const cagr = (Math.pow((endingValue / beginningValue), (1 / years)) - 1) * 100;
            return { cagrPercentage: parseFloat(cagr.toFixed(2)) };
          },
        }),
        projectFutureValue: tool({
          description: 'Project the future value of a portfolio based on current value, monthly contributions, and estimated annual growth rate (CAGR).',
          parameters: z.object({
            currentValue: z.number().describe('The current total value of the portfolio.'),
            monthlyContribution: z.number().describe('The amount contributed every month.'),
            annualReturnRate: z.number().describe('The estimated annual rate of return (in percent, e.g. 12).'),
            years: z.number().describe('The number of years to project.'),
          }),
          execute: async (args: any) => {
            const { currentValue, monthlyContribution, annualReturnRate, years } = args;
            if (years <= 0) return { projectedValue: 0, totalInvested: 0, estimatedReturns: 0, error: "Years must be greater than zero." };
            const monthlyRate = (annualReturnRate / 100) / 12;
            const months = years * 12;
            // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
            const futureValuePV = currentValue * Math.pow(1 + monthlyRate, months);
            const futureValuePMT = monthlyRate === 0 
                ? monthlyContribution * months 
                : monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
            
            const totalProjected = futureValuePV + futureValuePMT;
            const totalInvested = currentValue + (monthlyContribution * months);
            return { 
                projectedValue: parseFloat(totalProjected.toFixed(2)),
                totalInvested: parseFloat(totalInvested.toFixed(2)),
                estimatedReturns: parseFloat((totalProjected - totalInvested).toFixed(2))
            };
          },
        }),
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in PortfolioGPT:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
