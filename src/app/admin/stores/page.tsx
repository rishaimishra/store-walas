import { getAllStores, StoreWithAdminInfo } from "@/features/stores/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StoreActions } from "@/features/stores/components/store-actions";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  const { stores, error } = await getAllStores();

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Store Management</h2>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores?.map((store: StoreWithAdminInfo) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-bold">{store.name}</div>
                    <div className="text-xs text-muted-foreground">/{store.slug}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{store.owner.name}</div>
                    <div className="text-xs text-muted-foreground">{store.owner.email}</div>
                  </div>
                </TableCell>
                <TableCell>{store._count.products}</TableCell>
                <TableCell>
                  {store.isApproved ? (
                    <Badge variant="default" className="bg-green-600">Approved</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {store.isActive ? (
                    <Badge variant="outline" className="border-green-600 text-green-600">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <StoreActions store={store} />
                </TableCell>
              </TableRow>
            ))}
            {stores?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No stores found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
