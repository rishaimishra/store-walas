import { getStoreOrder } from "@/features/orders/actions/store";
import { ChevronLeft, Package, MapPin, Calendar, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusActions } from "@/features/orders/components/order-status-actions";
import { format } from "date-fns";

export default async function StoreOrderDetailsPage({
  params,
}: {
  params: Promise<{ storeId: string; orderId: string }>;
}) {
  const { storeId, orderId } = await params;
  const { order } = await getStoreOrder(storeId, orderId);

  if (!order) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/${storeId}/orders`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Order {order.id.slice(-8).toUpperCase()}
              <Badge variant="outline" className={`${getStatusColor(order.status)} ml-2`}>
                {order.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground">Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' h:mm a")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 rounded border bg-muted flex-shrink-0 overflow-hidden">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold">{item.product.name}</h4>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {item.variant && (
                          <>
                            {item.variant.size && <Badge variant="secondary" className="text-[10px]">{item.variant.size}</Badge>}
                            {item.variant.color && <Badge variant="secondary" className="text-[10px]">{item.variant.color}</Badge>}
                          </>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right font-bold">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                      <div className="text-xs font-normal text-muted-foreground">
                        ${Number(item.price).toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-end pt-2">
                  <div className="w-full max-w-[200px] space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusActions order={{ id: order.id, storeId, status: order.status }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">{order.customer.email}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Shipping Address
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.shippingAddress}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
