import { db } from "@/lib/db";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { StoreFilterSidebar } from "@/features/stores/components/store-filter-sidebar";
import { ProductCard } from "@/components/shared/product-card";
import { cn } from "@/lib/utils";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; size?: string; color?: string; category?: string }>;
}) {
  const { q: query, size, color, category } = await searchParams;

  const products = await db.product.findMany({
    where: {
      ...(query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      } : {}),
      store: { isActive: true, isApproved: true },
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

  // Fetch global unique sizes and colors for filters
  const allVariants = await db.productVariant.findMany({
    where: {
        product: { store: { isActive: true, isApproved: true } },
        stock: { gt: 0 }
    },
    select: { size: true, color: true }
  });

  const uniqueSizes = Array.from(new Set(allVariants.map((v: { size: string | null }) => v.size).filter(Boolean))) as string[];
  const uniqueColors = Array.from(new Set(allVariants.map((v: { color: string | null }) => v.color).filter(Boolean))) as string[];

  // Fetch all active categories
  const categories = await db.category.findMany({
      where: { products: { some: { store: { isActive: true, isApproved: true } } } },
      select: { name: true, slug: true },
      distinct: ['slug']
  });

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col gap-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-6">
            {query ? `Results for "${query}"` : "Browse Marketplace"}
          </h1>
          <SearchInput />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="sticky top-24">
              <StoreFilterSidebar sizes={uniqueSizes} colors={uniqueColors} />

              <div className="mt-12 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories</h4>
                  <div className="flex flex-col gap-2">
                      <Link
                          href="/search"
                          className={cn(
                              "text-sm hover:text-primary transition-colors",
                              !category ? "font-bold text-primary" : "text-muted-foreground"
                          )}
                      >
                          All Categories
                      </Link>
                      {categories.map((cat: { name: string; slug: string }) => (
                          <Link
                              key={cat.slug}
                              href={`/search?category=${cat.slug}${query ? `&q=${query}` : ""}${size ? `&size=${size}` : ""}${color ? `&color=${color}` : ""}`}
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

          {/* Results Grid */}
          <main className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div>
                <p className="text-lg font-semibold">{products.length} Products Found</p>
                {(size || color || category) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Active filters: {[category, size, color].filter(Boolean).join(", ")}
                    </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={JSON.parse(JSON.stringify(product))} />
              ))}

              {products.length === 0 && (
                <div className="col-span-full py-40 text-center flex flex-col items-center justify-center border rounded-lg bg-muted/10">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-xl font-bold">No products found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
                  <Button render={<Link href="/search" />} className="mt-6" variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
