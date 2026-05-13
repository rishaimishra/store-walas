import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Store as StoreIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const stores = await db.store.findMany({
    where: { ownerId: session.user.id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Hub</h1>
          <p className="text-muted-foreground">Manage your existing stores or create a new one.</p>
        </div>
        <Button render={<Link href="/dashboard/new" />}>
          <Plus className="mr-2 h-4 w-4" /> Create New Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store: { id: string; name: string; slug: string; logoUrl: string | null; isActive: boolean; _count: { products: number } }) => (
          <Card key={store.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <StoreIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle>{store.name}</CardTitle>
                  <CardDescription>/{store.slug}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Products</span>
                <span className="font-bold">{store._count.products}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Status</span>
                <span className={store.isActive ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                  {store.isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" render={<Link href={`/dashboard/${store.id}`} />} disabled={!store.isActive}>
                Manage Store
              </Button>
            </CardFooter>
          </Card>
        ))}

        {stores.length === 0 && (
          <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <StoreIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No stores found</h3>
            <p className="text-muted-foreground mb-6">You haven&apos;t created any stores yet. Start your selling journey today!</p>
            <Button render={<Link href="/dashboard/new" />}>
              Create Your First Store
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
