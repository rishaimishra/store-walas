import { db } from "@/lib/db";
import { getProducts } from "@/features/products/actions";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/features/products/components/product-actions";
import { Product, Category, ProductImage, ProductVariant } from "@prisma/client";

type ProductWithDetails = Product & {
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
};

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const { products } = await getProducts(storeId);

  const store = await db.store.findUnique({
      where: { id: storeId },
      select: { slug: true }
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your store inventory and styles.</p>
        </div>
        <Button render={<Link href={`/dashboard/${storeId}/products/new`} />}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product: ProductWithDetails) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                        {product.images[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="object-cover h-full w-full" />
                        ) : (
                            <Package className="h-5 w-5 text-muted-foreground opacity-50" />
                        )}
                    </div>
                    <span>{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category.name}</Badge>
                </TableCell>
                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={product.stock <= 5 ? "text-destructive font-bold" : ""}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {product.variants.length} variant(s)
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ProductActions product={product} storeId={storeId} storeSlug={store?.slug} />
                </TableCell>
              </TableRow>
            ))}
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
