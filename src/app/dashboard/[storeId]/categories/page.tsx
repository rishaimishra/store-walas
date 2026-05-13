import { getCategories } from "@/features/products/actions/categories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateCategoryModal } from "@/features/products/components/create-category-modal";

export default async function CategoriesPage({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = await params;
  const { categories, error } = await getCategories(storeId);

  if (error) {
    return <div className="text-destructive p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground text-sm">
            Organize your products into meaningful groups.
          </p>
        </div>
        <CreateCategoryModal storeId={storeId} />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>{category._count.products}</TableCell>
                <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {categories?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No categories found. Create your first category to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
