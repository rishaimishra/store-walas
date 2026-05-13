import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/shared/search-input";
import { ShoppingBag, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/features/auth/components/user-nav";
import { CartSheet } from "@/components/features/cart-sheet";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shared/product-card";
import { Product, ProductImage, Store, Category, ProductVariant, Review } from "@prisma/client";

type ProductWithRelations = Product & {
  images: ProductImage[];
  store: Pick<Store, "name" | "slug">;
  category: Category;
  variants: ProductVariant[];
  reviews: Review[];
};

export default async function HomePage() {
  const [stores, newArrivals] = await Promise.all([
    db.store.findMany({
      where: { isApproved: true, isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      take: 6,
      orderBy: { createdAt: "desc" }
    }),
    db.product.findMany({
        where: { store: { isApproved: true, isActive: true }, stock: { gt: 0 } },
        include: {
            images: { take: 1 },
            store: { select: { name: true, slug: true } },
            category: true,
            variants: true,
            reviews: true,
        },
        take: 8,
        orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>Marketplace</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <Suspense fallback={<Skeleton className="h-9 w-full" />}>
              <SearchInput placeholder="Search products, brands..." />
            </Suspense>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" render={<Link href="/dashboard" />} className="hidden sm:inline-flex">
              Sell
            </Button>
            <CartSheet />
            <UserNav />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Your Favorite Brands, <br />All in One Place
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Discover unique styles from independent clothing stores across the world.
              Support local brands and find your next favorite outfit.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="px-8" render={<Link href="/search" />}>
                Shop All Products
              </Button>
              <Button size="lg" variant="outline" className="px-8" render={<Link href="/stores" />}>
                Browse Stores
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Stores */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">Featured Stores</h2>
              <Button variant="link" render={<Link href="/stores" />}>
                View all stores
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stores.map((store: { id: string; name: string; slug: string; description: string | null; logoUrl: string | null; bannerUrl: string | null; _count: { products: number } }) => (
                <Card key={store.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-muted relative">
                    {store.bannerUrl ? (
                      <img
                        src={store.bannerUrl}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/20">
                        <StoreIcon className="h-12 w-12 text-accent" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {store.logoUrl && (
                        <img
                          src={store.logoUrl}
                          alt={`${store.name} logo`}
                          className="w-12 h-12 rounded-full border bg-background -mt-10 z-10"
                        />
                      )}
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {store.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {store.description || "No description available."}
                    </p>
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      {store._count.products} Products
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" render={<Link href={`/${store.slug}`} />}>
                      Visit Store
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold">New Arrivals</h2>
                <p className="text-muted-foreground mt-1">The latest styles from our top sellers.</p>
              </div>
              <Button variant="outline" render={<Link href="/search" />}>
                Shop All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product: ProductWithRelations) => (
                <ProductCard key={product.id} product={JSON.parse(JSON.stringify(product))} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-primary">All Products</Link></li>
                <li><Link href="/search?sort=new" className="hover:text-primary">New Arrivals</Link></li>
                <li><Link href="/stores" className="hover:text-primary">Featured Brands</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Sell</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard/new" className="hover:text-primary">Open a Store</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary">Seller Dashboard</Link></li>
                <li>Selling Guide</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Order Tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Multi-Store Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
