import { getCustomerOrders } from "@/features/orders/actions";
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
import { Eye, ShoppingBag, ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CustomerOrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login?callbackUrl=/orders");
  }

  const { orders, error } = await getCustomerOrders();

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
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span>Marketplace</span>
          </Link>
          <Button render={<Link href="/" />} variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Back Home
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col gap-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and view order history.
          </p>
        </div>

        {error && <div className="p-4 mb-6 text-destructive bg-destructive/10 rounded-lg">{error}</div>}

        <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Order #</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order: any) => (
                <TableRow key={order.id} className="cursor-pointer group">
                  <TableCell className="font-mono text-xs font-bold">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{order.store.name}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-bold">
                    ${Number(order.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" render={<Link href={`/orders/${order.id}`} />}>
                      <Eye className="h-4 w-4 mr-2" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!orders || orders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="p-4 bg-muted rounded-full">
                        <ShoppingBag className="h-10 w-10 opacity-20" />
                      </div>
                      <p>You haven&apos;t placed any orders yet.</p>
                      <Button render={<Link href="/search" />}>Start Shopping</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
