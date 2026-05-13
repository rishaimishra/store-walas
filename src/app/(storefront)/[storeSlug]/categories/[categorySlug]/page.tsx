import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/features/products/components/add-to-cart-button";

import { StoreFilterSidebar } from "@/features/stores/components/store-filter-sidebar";
import { ProductCard } from "@/components/shared/product-card";
import { cn } from "@/lib/utils";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { storeSlug: string; categorySlug: string };
  searchParams: { size?: string; color?: string };
}) {
  const { storeSlug, categorySlug } = await params;
  const { size, color } = await searchParams;

  const store = await db.store.findUnique({
    where: { slug: storeSlug, isActive: true, isApproved: true },
    include: {
      categories: {
          select: { id: true, name: true, slug: true }
      },
    },
  });

  if (!store) {
    notFound();
  }

  const category = store.categories.find(c => c.slug === categorySlug);

  if (!category) {
      notFound();
  }

  // Fetch products with filters
  const products = await db.product.findMany({
    where: {
      storeId: store.id,
      categoryId: category.id,
      stock: { gt: 0 },
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
      store: { select: { name: true } },
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
    <div className="flex flex-col gap-12 pb-20 pt-10">
      {/* Header Section */}
      <section className="container mx-auto px-4">
        <Link
          href={`/${storeSlug}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {store.name}
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight">{category.name}</h1>
        <p className="text-muted-foreground mt-2">Explore our collection of {category.name.toLowerCase()}.</p>
      </section>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="sticky top-24">
                <StoreFilterSidebar sizes={uniqueSizes} colors={uniqueColors} />

                <div className="mt-12 space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Store Categories</h4>
                    <div className="flex flex-col gap-2">
                        <Link
                            href={`/${storeSlug}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            All Items
                        </Link>
                        {store.categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${storeSlug}/categories/${cat.slug}${size ? `?size=${size}` : ""}${color ? `${size ? "&" : "?"}color=${color}` : ""}`}
                                className={cn(
                                    "text-sm hover:text-primary transition-colors",
                                    categorySlug === cat.slug ? "font-bold text-primary" : "text-muted-foreground"
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
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div>
                <p className="text-lg font-semibold">{products.length} Products Found</p>
                {(size || color) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Filtered by: {size} {size && color && " | "} {color}
                    </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={JSON.parse(JSON.stringify(product))} showStore={false} />
              ))}

              {products.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg bg-muted/10">
                  No products found matching your filters in this category.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
