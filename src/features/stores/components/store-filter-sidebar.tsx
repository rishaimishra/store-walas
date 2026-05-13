"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface StoreFilterSidebarProps {
  sizes: string[];
  colors: string[];
}

export function StoreFilterSidebar({ sizes, colors }: StoreFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedSize = searchParams.get("size");
  const selectedColor = searchParams.get("color");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(name) === value) {
          params.delete(name);
      } else {
          params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const clearFilters = () => {
      router.push(window.location.pathname);
  };

  const hasFilters = selectedSize || selectedColor;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Filters</h3>
        {hasFilters && (
            <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
            >
                <X className="h-3 w-3 mr-1" /> Clear All
            </Button>
        )}
      </div>

      <Separator />

      {/* Color Filter */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Color</h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  onClick={() => router.push(`?${createQueryString("color", color)}`, { scroll: false })}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:border-primary"
                  )}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Filter */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Size</h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => router.push(`?${createQueryString("size", size)}`, { scroll: false })}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:border-primary"
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
