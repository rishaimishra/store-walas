"use client";

import { ProductVariant } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantSelect,
}: VariantSelectorProps) {
  if (variants.length === 0) return null;

  // Extract unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));

  const handleSelect = (size?: string | null, color?: string | null) => {
    const found = variants.find((v) => v.size === size && v.color === color);
    if (found) {
      onVariantSelect(found);
    }
  };

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Color
          </h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedVariant?.color === color;
              const isAvailable = variants.some(
                (v) => v.color === color && v.stock > 0
              );

              return (
                <button
                  key={color}
                  disabled={!isAvailable}
                  onClick={() => handleSelect(selectedVariant?.size, color)}
                  className={cn(
                    "px-4 py-2 rounded-md border text-sm font-medium transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:border-primary",
                    !isAvailable && "opacity-20 cursor-not-allowed"
                  )}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Size
          </h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedVariant?.size === size;
              const isAvailable = variants.some(
                (v) => v.size === size && v.stock > 0
              );

              return (
                <button
                  key={size}
                  disabled={!isAvailable}
                  onClick={() => handleSelect(size, selectedVariant?.color)}
                  className={cn(
                    "px-4 py-2 rounded-md border text-sm font-medium transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:border-primary",
                    !isAvailable && "opacity-20 cursor-not-allowed"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
