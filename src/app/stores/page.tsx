import { db } from "@/lib/db";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store as StoreIcon, Search } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "@/components/shared/search-input";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function StoresListPage() {
  const stores = await db.store.findMany({
    where: { isApproved: true, isActive: true },
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>Marketplace</span>
          </Link>
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Suspense fallback={<Skeleton className="h-9 w-full" />}>
              <SearchInput placeholder="Search stores..." />
            </Suspense>
          </div>
          <Button render={<Link href="/" />} variant="outline">
            Back Home
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col gap-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Our Stores</h1>
          <p className="text-xl text-muted-foreground">
            Explore {stores.length} independent brands and their unique collections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <Card key={store.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="h-40 bg-muted relative">
                {store.bannerUrl ? (
                  <img
                    src={store.bannerUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/10">
                    <StoreIcon className="h-10 w-10 text-accent opacity-20" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {store.logoUrl ? (
                    <img
                      src={store.logoUrl}
                      alt={`${store.name} logo`}
                      className="w-14 h-14 rounded-full border bg-background -mt-12 z-10 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full border bg-primary/10 -mt-12 z-10 flex items-center justify-center font-bold text-primary shadow-sm">
                      {store.name.charAt(0)}
                    </div>
                  )}
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {store.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 h-15">
                  {store.description || "A premium clothing store offering unique styles and high-quality apparel."}
                </p>
                <div className="mt-6 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center">
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    {store._count.products} Products
                  </div>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <div>Since {new Date(store.createdAt).getFullYear()}</div>
                </div>
              </CardContent>
              <CardFooter border-t>
                <Button className="w-full" render={<Link href={`/${store.slug}`} />}>
                  Visit Storefront
                </Button>
              </CardFooter>
            </Card>
          ))}

          {stores.length === 0 && (
            <div className="col-span-full py-40 text-center border rounded-lg bg-muted/10">
              <StoreIcon className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <h3 className="text-xl font-bold">No stores found</h3>
              <p className="text-muted-foreground mt-2">Check back later for new brands!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
