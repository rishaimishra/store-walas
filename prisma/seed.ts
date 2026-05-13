import { PrismaClient, UserRole, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  console.log("Prisma models available:", Object.keys(prisma).filter(k => !k.startsWith("_")));

  // Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
    },
  });

  // Create Store Owners
  const owner1 = await prisma.user.upsert({
    where: { email: "owner1@example.com" },
    update: {},
    create: {
      email: "owner1@example.com",
      name: "John Doe",
      role: UserRole.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@example.com" },
    update: {},
    create: {
      email: "owner2@example.com",
      name: "Jane Smith",
      role: UserRole.STORE_OWNER,
    },
  });

  // Create Stores
  const store1 = await prisma.store.upsert({
    where: { slug: "urban-style" },
    update: {},
    create: {
      name: "Urban Style",
      slug: "urban-style",
      description: "Modern urban clothing for everyone.",
      ownerId: owner1.id,
      isApproved: true,
      isActive: true,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { slug: "vintage-vibes" },
    update: {},
    create: {
      name: "Vintage Vibes",
      slug: "vintage-vibes",
      description: "Classic vintage pieces from the 90s.",
      ownerId: owner2.id,
      isApproved: false,
      isActive: true,
    },
  });

  // Create Categories
  const cat1 = await prisma.category.upsert({
    where: {
      storeId_slug: {
        storeId: store1.id,
        slug: "t-shirts",
      },
    },
    update: {},
    create: {
      name: "T-Shirts",
      slug: "t-shirts",
      storeId: store1.id,
    },
  });

  // Create Products
  await prisma.product.upsert({
    where: {
      storeId_slug: {
        storeId: store1.id,
        slug: "classic-white-tee",
      },
    },
    update: {},
    create: {
      name: "Classic White Tee",
      slug: "classic-white-tee",
      description: "A simple, high-quality white t-shirt.",
      price: 29.99,
      stock: 100,
      storeId: store1.id,
      categoryId: cat1.id,
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
