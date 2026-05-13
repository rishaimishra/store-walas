import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserNav } from "@/features/auth/components/user-nav";
import { CartSheet } from "@/components/features/cart-sheet";
import { SearchInput } from "@/components/shared/search-input";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;

  const store = await db.store.findUnique({
    where: { slug: storeSlug, isActive: true, isApproved: true },
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Store Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href={`/${storeSlug}`} className="flex items-center gap-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {store.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-xl">{store.name}</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
            <Suspense fallback={<Skeleton className="h-9 w-full" />}>
              <SearchInput placeholder={`Search in ${store.name}...`} />
            </Suspense>
          </div>

          <nav className="flex items-center gap-2">
            <CartSheet />
            <UserNav />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Store Footer */}
      <footer className="border-t py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">{store.name}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {store.description || "Welcome to our store. We offer high-quality clothing and accessories."}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={`/${storeSlug}`} className="hover:text-primary">Home</Link></li>
                <li><Link href={`/${storeSlug}/products`} className="hover:text-primary">All Products</Link></li>
                <li><Link href={`/${storeSlug}/about`} className="hover:text-primary">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Shipping Policy</li>
                <li>Returns & Exchanges</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
            <p>© 2026 {store.name}. Powered by Multi-Store Marketplace.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
