import { prisma } from "./lib/prisma";

async function check() {
  const keys = Object.keys(prisma);
  const models = keys.filter(k => k[0] !== '_' && typeof (prisma as any)[k] === 'object');
  console.log("Model Keys:", models);
  
  if (models.includes('stock')) console.log("Found: stock");
  if (models.includes('stocks')) console.log("Found: stocks");
  
  const s = await (prisma as any).stock?.findFirst() || await (prisma as any).stocks?.findFirst();
  if (s) {
      console.log("Sample Data Fields:", Object.keys(s));
  }
}

check();
