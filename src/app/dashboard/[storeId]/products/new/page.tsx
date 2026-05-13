import { db } from "@/lib/db";
import { ProductForm } from "@/features/products/components/product-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NewProductPage({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = await params;

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
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground">Create a new style for your collection.</p>
      </div>

      <div className="border rounded-lg bg-card p-8">
        <ProductForm storeId={storeId} categories={categories} />
      </div>
    </div>
  );
}
