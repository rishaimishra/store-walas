"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartSheet() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }

  const total = cart.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const itemCount = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Your cart is empty</p>
            <SheetClose
              render={
                <Button variant="outline" render={<Link href="/" />}>
                  Browse Products
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6">
              <div className="space-y-6">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 rounded-md border bg-muted overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.storeName}</p>
                          {item.variant && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {item.variant.size && `Size: ${item.variant.size}`}
                              {item.variant.size && item.variant.color && " | "}
                              {item.variant.color && `Color: ${item.variant.color}`}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => cart.removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center border rounded-md h-8">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-bold text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="flex justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Shipping and taxes calculated at checkout.
              </p>
              <SheetFooter className="pt-2">
                <Button className="w-full h-12 text-lg" render={<Link href="/checkout" />}>
                  Checkout
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
