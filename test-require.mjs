import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Testing with ESM...");
  console.log("Models:", Object.keys(prisma).filter(k => !k.startsWith("_")));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
