import { getStoreOrders } from "@/features/orders/actions/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const { orders, error } = await getStoreOrders(storeId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Monitor and manage your store&apos;s customer orders.</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(-8).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customer.name}</span>
                    <span className="text-xs text-muted-foreground">{order.customer.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="font-bold">
                  ${Number(order.totalAmount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order._count.items} item(s)</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" render={<Link href={`/dashboard/${storeId}/orders/${order.id}`} />}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!orders || orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShoppingCart className="h-8 w-8 opacity-20" />
                    <span>No orders found for this store yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
