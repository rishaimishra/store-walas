import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, ChevronLeft, Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { ProductPurchaseSection } from "@/features/products/components/product-purchase-section";
import { ReviewForm } from "@/features/products/components/review-form";

export default async function ProductDetailsPage({
  params,
}: {
  params: { storeSlug: string; productSlug: string };
}) {
  const { storeSlug, productSlug } = await params;

  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      store: {
        slug: storeSlug,
        isActive: true,
        isApproved: true,
      },
    },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      store: true,
      variants: true,
      reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!product) {
    notFound();
  }

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href={`/${storeSlug}`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {product.store.name}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="h-20 w-20 text-muted-foreground opacity-20" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.slice(1).map((image) => (
              <div
                key={image.id}
                className="aspect-square bg-muted rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img src={image.url} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="space-y-2">
            <Badge variant="outline" className="uppercase tracking-wider">
              {product.category.name}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">{product.name}</h1>
          </div>

          <div className="mt-6">
            <ProductPurchaseSection product={product} />
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">About this item</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-primary" />
                </div>
                <span>30-day easy returns policy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <span>Verified store on Marketplace</span>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Store Info Mini Card */}
          <div className="rounded-xl border p-6 bg-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border">
                {product.store.logoUrl ? (
                  <img src={product.store.logoUrl} className="h-full w-full rounded-full object-cover" alt="" />
                ) : (
                  product.store.name.charAt(0)
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sold by</p>
                <h4 className="font-bold text-lg">{product.store.name}</h4>
              </div>
            </div>
            <Button variant="outline" render={<Link href={`/${storeSlug}`} />}>
              View Store
            </Button>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 font-bold text-foreground">{averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">({product.reviews.length} reviews)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    {product.reviews.map((review) => (
                        <div key={review.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={review.user.image || ""} />
                                        <AvatarFallback>{review.user.name?.[0] || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-bold">{review.user.name || "Anonymous"}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-muted opacity-30")} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">&quot;{review.comment}&quot;</p>
                        </div>
                    ))}
                    {product.reviews.length === 0 && (
                        <p className="text-muted-foreground italic py-10 text-center border rounded-lg border-dashed">No reviews yet. Be the first to review this product!</p>
                    )}
                </div>
                <div>
                    <ReviewForm productId={product.id} />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
