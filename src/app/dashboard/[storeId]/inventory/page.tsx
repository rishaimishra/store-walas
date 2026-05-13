import { getProducts, ProductWithRelations } from "@/features/products/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, Edit2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductVariant } from "@prisma/client";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const { products, error } = await getProducts(storeId);

  if (error) {
    return <div className="text-destructive p-4">{error}</div>;
  }

  // Flatten products and variants for a unified inventory view
  interface InventoryItem {
    id: string;
    productId: string;
    name: string;
    type: string;
    size: string;
    color: string;
    stock: number;
    price: number;
    isVariant: boolean;
  }

  const inventoryItems = (products as ProductWithRelations[])?.flatMap((product: ProductWithRelations) => {
    const baseItem: InventoryItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      type: "Base Product",
      size: "-",
      color: "-",
      stock: product.stock,
      price: Number(product.price),
      isVariant: false,
    };

    const variantItems: InventoryItem[] = product.variants.map((v: ProductVariant) => ({
      id: v.id,
      productId: product.id,
      name: product.name,
      type: "Variant",
      size: v.size || "Default",
      color: v.color || "Default",
      stock: v.stock,
      price: v.price ? Number(v.price) : Number(product.price),
      isVariant: true,
    }));

    return [baseItem, ...variantItems];
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <p className="text-muted-foreground text-sm">
          Comprehensive view of stock levels across all products and variants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                  <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Total SKUs</p>
                  <p className="text-2xl font-bold">{inventoryItems?.length}</p>
              </div>
          </div>
          <div className="p-4 rounded-lg border bg-card flex items-center gap-4">
              <div className="p-2 bg-yellow-500/10 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">
                      {inventoryItems?.filter((i: InventoryItem) => i.stock > 0 && i.stock <= 5).length}
                  </p>
              </div>
          </div>
          <div className="p-4 rounded-lg border bg-card flex items-center gap-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Out of Stock</p>
                  <p className="text-2xl font-bold text-destructive">
                      {inventoryItems?.filter((i: InventoryItem) => i.stock === 0).length}
                  </p>
              </div>
          </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Item Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems?.map((item: InventoryItem) => (
              <TableRow key={item.id} className={item.isVariant ? "bg-muted/20" : "font-medium"}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className={item.isVariant ? "text-sm ml-4" : "font-bold"}>
                        {item.isVariant && "└ "} {item.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={item.isVariant ? "text-[10px] h-5" : "text-[10px] h-5 bg-primary/5"}>
                        {item.type}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm">{item.size}</TableCell>
                <TableCell className="text-sm">{item.color}</TableCell>
                <TableCell className="text-sm">${Number(item.price).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={item.stock <= 5 ? "text-destructive font-bold" : ""}>
                    {item.stock}
                  </span>
                </TableCell>
                <TableCell>
                  {item.stock > 5 ? (
                    <Badge variant="outline" className="border-green-600 text-green-600 text-[10px]">
                      Adequate
                    </Badge>
                  ) : item.stock > 0 ? (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-[10px]">
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/${storeId}/products/${item.productId}`} />} className="h-8 w-8">
                        <Edit2 className="h-3 w-3" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
            {inventoryItems?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No inventory found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
