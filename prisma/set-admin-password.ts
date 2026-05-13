import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";

  console.log(`Searching for user: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error("Admin user not found. Please run 'npx tsx prisma/seed.ts' first.");
    return;
  }

  console.log("\n--- Admin Password Instructions ---");
  console.log("To set up your admin account safely:");
  console.log("1. Run: npx prisma studio");
  console.log("2. Find and delete the current 'admin@example.com' user if it exists.");
  console.log("3. Open your browser to: http://localhost:3000/auth/register");
  console.log("4. Create a new account with email 'admin@example.com' and your password.");
  console.log("5. Go back to Prisma Studio and change the 'role' for this user to 'SUPER_ADMIN'.");
  console.log("6. You can now log in and access /admin/dashboard.");
  console.log("-----------------------------------\n");
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
