import { prisma } from "./lib/prisma";

async function test() {
  try {
    await prisma.user.upsert({
      where: { id: "user_2pvR1V0X5S7uJz9M3n8Q6W4YtLp" },
      update: {},
      create: {
        id: "user_2pvR1V0X5S7uJz9M3n8Q6W4YtLp",
        email: "demo@quantr.app",
        name: "Demo Investor",
        plan: "ELITE"
      }
    });
    console.log("Upsert Success");
  } catch(e: any) {
    console.error("UPSERT ERROR:", e.message);
  }

  try {
    const stock = await prisma.stock.findFirst({ where: { symbol: "RELIANCE" }});
    const holding = await prisma.portfolio.create({
      data: {
        userId: "user_2pvR1V0X5S7uJz9M3n8Q6W4YtLp",
        stockId: stock!.id,
        quantity: 10,
        buyPrice: 2500,
        buyDate: new Date()
      }
    });
    console.log("Insert Success", holding);
  } catch(e: any) {
    console.error("INSERT ERROR", e.message);
  }
}

test();
