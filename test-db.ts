import { PrismaClient } from "./node_modules/.prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma Client...");
  try {
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    console.log("Prisma client is working correctly!");
  } catch (error) {
    console.error("Prisma client error:", error);
    console.log("Models available on prisma object:", Object.keys(prisma).filter(k => !k.startsWith("_")));
  } finally {
    await prisma.$disconnect();
  }
}

main();
