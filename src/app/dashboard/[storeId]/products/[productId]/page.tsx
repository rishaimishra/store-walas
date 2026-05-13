import { db } from "@/lib/db";
import { getProduct } from "@/features/products/actions";
import { ProductForm } from "@/features/products/components/product-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { storeId: string; productId: string };
}) {
  const { storeId, productId } = await params;
  const { product } = await getProduct(storeId, productId);

  if (!product) {
    notFound();
  }

  const categories = await db.category.findMany({
      orderBy: { name: "asc" }
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/${storeId}/products`}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to products
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update your product details and variants.</p>
      </div>

      <div className="border rounded-lg bg-card p-8">
        <ProductForm storeId={storeId} categories={categories} initialData={product} />
      </div>
    </div>
  );
}
