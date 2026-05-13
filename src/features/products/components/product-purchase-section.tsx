"use client";

import { useState } from "react";
import { Product, ProductVariant } from "@prisma/client";
import { VariantSelector } from "./variant-selector";
import { AddToCartButton } from "./add-to-cart-button";
import { cn } from "@/lib/utils";

interface ProductPurchaseSectionProps {
  product: Product & {
    images: { url: string }[];
    store: { name: string; slug: string };
    variants: ProductVariant[];
  };
}

export function ProductPurchaseSection({ product }: ProductPurchaseSectionProps) {
  // If there are variants, don't select one by default to force user selection
  // unless there's only one variant.
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length === 1 ? product.variants[0] : null
  );

  const hasVariants = product.variants.length > 0;
  const isSelectionRequired = hasVariants && !selectedVariant;

  // Use variant price if available, otherwise base price
  const displayPrice = selectedVariant?.price
    ? Number(selectedVariant.price)
    : Number(product.price);

  const displayStock = selectedVariant
    ? selectedVariant.stock
    : product.stock;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-baseline gap-4">
            <span className="text-4xl font-extrabold text-primary">
                ${displayPrice.toFixed(2)}
            </span>
            {selectedVariant?.price && Number(product.price) !== displayPrice && (
                <span className="text-xl text-muted-foreground line-through">
                    ${Number(product.price).toFixed(2)}
                </span>
            )}
        </div>

        <p className={cn(
            "text-sm font-medium",
            displayStock > 0 ? "text-green-600" : "text-destructive"
        )}>
            {displayStock > 0 ? `In Stock (${displayStock} available)` : "Out of Stock"}
        </p>
      </div>

      {hasVariants && (
        <div className="border-t pt-8">
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onVariantSelect={setSelectedVariant}
          />
          {isSelectionRequired && (
            <p className="text-xs text-destructive mt-4 font-medium animate-pulse">
              * Please select a color and size to continue
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <AddToCartButton
          product={product}
          selectedVariant={selectedVariant}
          size="lg"
          className="w-full gap-2 text-lg h-14"
          disabled={isSelectionRequired || displayStock <= 0}
        />
      </div>
    </div>
  );
}
