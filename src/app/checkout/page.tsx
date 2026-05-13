"use client";

import Image from "next/image";
import { useCart, CartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, ChevronLeft, CreditCard, Truck } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { createOrder } from "@/features/orders/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) return null;

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="p-6 bg-muted rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some items to your cart before checking out.</p>
          <Button render={<Link href="/" />} className="w-full h-12">
            Back to Shopping
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
  const shipping = 10; // Flat rate for MVP
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (address.length < 10) {
      toast.error("Please enter a valid shipping address");
      return;
    }

    startTransition(async () => {
      const orderData = {
        items: cart.items.map((item: CartItem) => ({
          productId: item.productId,
          variantId: item.variant?.id,
          quantity: item.quantity,
          price: item.price,
          storeId: item.storeId,
        })),
        shippingAddress: address,
      };

      const result = await createOrder(orderData);

      if (result.success && result.orderIds) {
        toast.success("Order placed successfully!");
        cart.clearCart();
        const orderIdsParam = result.orderIds.join(",");
        router.push(`/orders/confirmation?ids=${orderIdsParam}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 lg:py-20">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Truck className="h-6 w-6" /> Shipping Information
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your full street address, apartment number, city, and zip code..."
                      className="min-h-[120px]"
                      value={address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-6 w-6" /> Payment Method
            </h2>
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-4 rounded-full border-4 border-primary" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Pay on Delivery (MVP Mode)</p>
                    <p className="text-xs text-muted-foreground">Full payment integration coming soon.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="hidden lg:block pt-4">
            <Button
              className="w-full h-14 text-lg"
              onClick={handlePlaceOrder}
              disabled={isPending}
            >
              {isPending ? "Processing Order..." : `Place Order ($${total.toFixed(2)})`}
            </Button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                {cart.items.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="h-14 w-14 rounded-md border bg-muted flex-shrink-0 overflow-hidden relative">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        {item.variant && (
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">
                            {item.variant.size && `Size: ${item.variant.size}`}
                            {item.variant.size && item.variant.color && " | "}
                            {item.variant.color && `Color: ${item.variant.color}`}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="lg:hidden">
              <Button
                className="w-full h-12"
                onClick={handlePlaceOrder}
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Place Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
