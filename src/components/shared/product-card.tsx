"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { AddToCartButton } from "@/features/products/components/add-to-cart-button";
import { Category, Product, ProductImage, ProductVariant, Store, Review } from "@prisma/client";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product & {
    category: Category;
    images: ProductImage[];
    store: Pick<Store, "name" | "slug">;
    variants: ProductVariant[];
    reviews?: Review[];
  };
  showStore?: boolean;
}

export function ProductCard({ product, showStore = true }: ProductCardProps) {
  const colorVariants = Array.from(new Set(product.variants.map((v: ProductVariant) => v.color).filter(Boolean)));
  const hasMultipleColors = colorVariants.length > 1;

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all bg-card">
      <Link href={`/${product.store.slug}/products/${product.slug}`}>
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Low Stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
              Out of Stock
            </Badge>
          )}
          {averageRating > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-background/90 backdrop-blur-sm rounded text-[10px] font-bold shadow-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">({product.reviews?.length})</span>
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start mb-1">
          <Badge variant="secondary" className="text-[10px] uppercase font-bold">
            {product.category.name}
          </Badge>
          {showStore && (
            <Link href={`/${product.store.slug}`} className="text-[10px] text-primary hover:underline font-medium">
              {product.store.name}
            </Link>
          )}
        </div>
        <CardTitle className="text-base font-bold line-clamp-1">
          <Link href={`/${product.store.slug}/products/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold text-primary">
                ${Number(product.price).toFixed(2)}
            </div>
            {hasMultipleColors && (
                <span className="text-[10px] text-muted-foreground font-medium">
                    {colorVariants.length} Colors
                </span>
            )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton
            product={product}
            variant="outline"
            className="w-full h-9 text-xs"
            disabled={product.stock === 0}
        />
      </CardFooter>
    </Card>
  );
}
