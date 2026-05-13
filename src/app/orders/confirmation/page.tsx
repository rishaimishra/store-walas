import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Suspense } from "react";

async function OrderNumbers({ ids }: { ids: string }) {
  const orderIds = ids.split(",");
  const orders = await db.order.findMany({
    where: { id: { in: orderIds } },
    select: { orderNumber: true, id: true }
  });

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Order Reference(s):</p>
      <div className="flex flex-wrap justify-center gap-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            {order.orderNumber}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const { ids } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto space-y-8">
        <div className="p-4 bg-green-50 rounded-full w-24 h-24 mx-auto flex items-center justify-center dark:bg-green-900/20">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your order has been placed and is being processed by the store owners.
          </p>

          {ids && (
            <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-lg mt-6" />}>
              <OrderNumbers ids={ids} />
            </Suspense>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4">
          <Button render={<Link href="/orders" />} size="lg" className="h-12 gap-2">
            <Package className="h-4 w-4" /> View My Orders
          </Button>
          <Button render={<Link href="/" />} variant="outline" size="lg" className="h-12 gap-2">
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          A confirmation email will be sent to you shortly with more details.
        </p>
      </div>
    </div>
  );
}
