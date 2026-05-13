"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { toast } from "sonner";
import { ProductVariant } from "@prisma/client";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number | string | { toString(): string }; // Decimal from Prisma
    images: { url: string }[];
    storeId: string;
    store: { name: string };
    slug: string;
  };
  selectedVariant?: ProductVariant | null;
  variant?: "default" | "outline";
  size?: "default" | "lg" | "sm";
  className?: string;
  showIcon?: boolean;
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  selectedVariant,
  variant = "default",
  size = "default",
  className,
  showIcon = true,
  disabled = false,
}: AddToCartButtonProps) {
  const cart = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate unique ID for cart item
    const cartItemId = selectedVariant
      ? `${product.id}-${selectedVariant.id}`
      : product.id;

    const cartItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: selectedVariant?.price
        ? Number(selectedVariant.price)
        : Number(product.price),
      quantity: 1,
      image: product.images[0]?.url,
      storeId: product.storeId,
      storeName: product.store.name,
      slug: product.slug,
      variant: selectedVariant ? {
        id: selectedVariant.id,
        size: selectedVariant.size || undefined,
        color: selectedVariant.color || undefined,
      } : undefined
    };

    cart.addItem(cartItem);
    toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.size || ""}${selectedVariant.size && selectedVariant.color ? ", " : ""}${selectedVariant.color || ""})` : ""} added to cart`);
  };

  return (
    <Button
      onClick={handleAdd}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
    >
      {showIcon && <ShoppingBag className="mr-2 h-4 w-4" />}
      Add to Cart
    </Button>
  );
}
