import YahooFinance from 'yahoo-finance2';
const yahooFinance = new (YahooFinance as any)();

async function test() {
  try {
    const q = await yahooFinance.quote('RELIANCE.NS');
    console.dir(q, { depth: null });
  } catch (err) {
    console.error(err);
  }
}
test();
