import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import yahooFinance from 'yahoo-finance2';
import fs from 'fs';

async function testAll() {
  const result: any = {};
  try {
    const q = await yahooFinance.quote('^NSEI');
    result.yahoo = "Success: " + q?.symbol;
  } catch (e: any) {
    result.yahoo = e.message || e.toString();
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.from('stocks').select('symbol').limit(1);
    if (error) throw error;
    result.supabase = "Success: " + JSON.stringify(data);
  } catch (e: any) {
    result.supabase = e.message || e.toString();
  }

  const prisma = new PrismaClient();
  try {
    const s = await prisma.stock.findFirst();
    result.prisma = "Success: " + s?.symbol;
  } catch (e: any) {
    result.prisma = e.message || e.toString();
  } finally {
    await prisma.$disconnect();
  }
  
  fs.writeFileSync('debug.json', JSON.stringify(result, null, 2));
}

testAll().catch(console.error);
