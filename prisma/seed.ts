import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  console.log("Prisma models available:", Object.keys(prisma).filter((k: string) => !k.startsWith("_")));

  // Create Super Admin
  await prisma.user.upsert({
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

  await prisma.store.upsert({
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

  const cat2 = await prisma.category.upsert({
      where: {
        storeId_slug: {
          storeId: store1.id,
          slug: "outerwear",
        },
      },
      update: {},
      create: {
        name: "Outerwear",
        slug: "outerwear",
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
      description: "A simple, high-quality white t-shirt made from 100% organic cotton. Perfect for everyday wear.",
      price: 29.99,
      stock: 100,
      storeId: store1.id,
      categoryId: cat1.id,
      images: {
          create: [
              { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop", order: 0 }
          ]
      },
      variants: {
          create: [
              { size: "S", color: "White", stock: 25 },
              { size: "M", color: "White", stock: 25 },
              { size: "L", color: "White", stock: 25 },
              { size: "XL", color: "White", stock: 25 },
          ]
      }
    },
  });

  await prisma.product.upsert({
    where: {
      storeId_slug: {
        storeId: store1.id,
        slug: "vintage-denim-jacket",
      },
    },
    update: {},
    create: {
      name: "Vintage Denim Jacket",
      slug: "vintage-denim-jacket",
      description: "A classic 90s style denim jacket with a relaxed fit and light wash finish.",
      price: 89.99,
      stock: 50,
      storeId: store1.id,
      categoryId: cat2.id,
      images: {
          create: [
              { url: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop", order: 0 }
          ]
      },
      variants: {
          create: [
              { size: "M", color: "Blue", stock: 20 },
              { size: "L", color: "Blue", stock: 20 },
              { size: "XL", color: "Blue", stock: 10 },
          ]
      }
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
