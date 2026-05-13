import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Package, MapPin, Calendar, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const order = await db.order.findUnique({
    where: { id: orderId, customerId: session.user.id },
    include: {
      store: { select: { name: true, slug: true } },
      items: {
        include: {
          product: { select: { name: true, slug: true, images: { take: 1 } } },
          variant: true
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link href="/orders" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to My Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" />
            <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge className="text-lg py-1 px-4 h-fit" variant={order.status === "DELIVERED" ? "default" : "secondary"}>
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item: { id: string; product: { name: string; slug: string; images: { url: string }[] }; variant: { size: string | null; color: string | null } | null; quantity: number; price: any }) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 rounded border bg-muted overflow-hidden flex-shrink-0">
                    {item.product.images[0] && (
                      <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/${order.store.slug}/products/${item.product.slug}`} className="font-bold hover:underline block truncate">
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.size && item.variant.color && " | "}
                        {item.variant.color && `Color: ${item.variant.color}`}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">${Number(item.price).toFixed(2)} each</p>
                  </div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">${(Number(order.totalAmount) + 10).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping & Store Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{order.shippingAddress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" /> Store Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-bold">{order.store.name}</p>
                <Link href={`/${order.store.slug}`} className="text-xs text-primary hover:underline">
                  Visit Storefront
                </Link>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                Contact Seller
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
