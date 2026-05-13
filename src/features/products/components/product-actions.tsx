"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { deleteProduct } from "../actions";
import { toast } from "sonner";
import { useTransition } from "react";
import Link from "next/link";

interface ProductActionsProps {
  product: {
    id: string;
    slug: string;
  };
  storeId: string;
  storeSlug?: string;
}

export function ProductActions({ product, storeId, storeSlug }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    startTransition(async () => {
      const result = await deleteProduct(storeId, product.id);
      if (result.success) {
        toast.success("Product deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem render={<Link href={`/dashboard/${storeId}/products/${product.id}`} />}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Product</span>
        </DropdownMenuItem>
        {storeSlug && (
            <DropdownMenuItem render={<Link href={`/${storeSlug}/products/${product.slug}`} target="_blank" />}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View Publicly</span>
            </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Product</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
