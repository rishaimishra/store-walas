import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/features/products/components/add-to-cart-button";

import { StoreFilterSidebar } from "@/features/stores/components/store-filter-sidebar";
import { ProductCard } from "@/components/shared/product-card";
import { cn } from "@/lib/utils";

export default async function StoreHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ size?: string; color?: string; category?: string }>;
}) {
  const { storeSlug } = await params;
  const { size, color, category } = await searchParams;

  const store = await db.store.findUnique({
    where: { slug: storeSlug, isActive: true, isApproved: true },
    include: {
      categories: true,
    },
  });

  if (!store) {
    notFound();
  }

  // Fetch products with filters
  const products = await db.product.findMany({
    where: {
      storeId: store.id,
      stock: { gt: 0 },
      ...(category ? { category: { slug: category } } : {}),
      ...(size || color ? {
          variants: {
              some: {
                  ...(size ? { size } : {}),
                  ...(color ? { color } : {}),
                  stock: { gt: 0 }
              }
          }
      } : {})
    },
    include: {
      category: true,
      images: { take: 1, orderBy: { order: "asc" } },
      store: { select: { name: true, slug: true } },
      variants: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch unique sizes and colors for this store to build filters
  const allStoreVariants = await db.productVariant.findMany({
    where: {
        product: { storeId: store.id },
        stock: { gt: 0 }
    },
    select: {
        size: true,
        color: true,
    }
  });

  const uniqueSizes = Array.from(new Set(allStoreVariants.map(v => v.size).filter(Boolean))) as string[];
  const uniqueColors = Array.from(new Set(allStoreVariants.map(v => v.color).filter(Boolean))) as string[];

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Banner Section */}
      <section className="relative h-[400px] w-full overflow-hidden bg-muted">
        {store.bannerUrl ? (
          <img
            src={store.bannerUrl}
            alt={`${store.name} banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5">
            <h1 className="text-4xl md:text-6xl font-bold opacity-10 uppercase tracking-widest">
              {store.name}
            </h1>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {store.name}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
              {store.description || "Discover our latest collection and timeless styles."}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="sticky top-24">
                <StoreFilterSidebar sizes={uniqueSizes} colors={uniqueColors} />

                <div className="mt-12 space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories</h4>
                    <div className="flex flex-col gap-2">
                        <Link
                            href={`/${storeSlug}`}
                            className={cn(
                                "text-sm hover:text-primary transition-colors",
                                !category ? "font-bold text-primary" : "text-muted-foreground"
                            )}
                        >
                            All Items
                        </Link>
                        {store.categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${storeSlug}?category=${cat.slug}${size ? `&size=${size}` : ""}${color ? `&color=${color}` : ""}`}
                                className={cn(
                                    "text-sm hover:text-primary transition-colors",
                                    category === cat.slug ? "font-bold text-primary" : "text-muted-foreground"
                                )}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                    {category ? store.categories.find(c => c.slug === category)?.name : "Latest Arrivals"}
                </h2>
                {(size || color) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Filtered by: {size} {size && color && " | "} {color}
                    </p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{products.length} Products</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={JSON.parse(JSON.stringify(product))} showStore={false} />
              ))}

              {products.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg bg-muted/10">
                  No products found matching your filters.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
