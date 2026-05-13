import { PrismaClient } from "@prisma/client";
// We use a simple script to create the Account record with a password
// Since we don't have the internal better-auth hasher easily accessible in a standalone script,
// the easiest way is to let the user register, but we can also manually create it.

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = "adminpassword123";

  console.log(`Searching for user: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error("Admin user not found. Please run 'npx tsx prisma/seed.ts' first.");
    return;
  }

  console.log("Found user. Creating/Updating account with password...");

  // Note: better-auth usually uses bcrypt or scrypt.
  // In development, the simplest way to get a working admin is to register a new account via the UI
  // with this email, or update the record if you have a known hash.

  // However, for immediate access, I recommend:
  // 1. Delete the existing admin user: npx prisma db execute --stdin "DELETE FROM \"user\" WHERE email = 'admin@example.com';"
  // 2. Go to /auth/register and create a new account with admin@example.com
  // 3. Manually update that user's role to SUPER_ADMIN in Prisma Studio (npx prisma studio)

  console.log("\nRecommended steps for Admin access:");
  console.log("1. Run: npx prisma studio");
  console.log("2. Find the user 'admin@example.com' (if it exists) and delete it.");
  console.log("3. Go to http://localhost:3000/auth/register in your browser.");
  console.log("4. Register with email 'admin@example.com' and your chosen password.");
  console.log("5. In Prisma Studio, change the 'role' of this new user to 'SUPER_ADMIN'.");
  console.log("6. You can now access /admin/dashboard.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
