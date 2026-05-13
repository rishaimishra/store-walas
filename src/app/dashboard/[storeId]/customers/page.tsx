import { getStoreCustomers } from "@/features/stores/actions/customers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Users, Mail, Calendar, DollarSign, ShoppingBag } from "lucide-react";

export default async function CustomersPage({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = await params;
  const { customers, error } = await getStoreCustomers(storeId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">View and manage the customers who have shopped at your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Total Customers</p>
                  <p className="text-2xl font-bold">{customers?.length || 0}</p>
              </div>
          </div>
          <div className="p-4 rounded-lg border bg-card flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Total Customer Spend</p>
                  <p className="text-2xl font-bold text-green-600">
                      ${customers?.reduce((acc, c) => acc + c.totalSpend, 0).toFixed(2) || "0.00"}
                  </p>
              </div>
          </div>
          <div className="p-4 rounded-lg border bg-card flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Avg. Orders per Customer</p>
                  <p className="text-2xl font-bold text-blue-600">
                      {customers?.length ? (customers.reduce((acc, c) => acc + c.orderCount, 0) / customers.length).toFixed(1) : "0.0"}
                  </p>
              </div>
          </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Total Spend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => {
              const initials = customer.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || customer.email[0].toUpperCase();

              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.image || ""} alt={customer.name || ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(customer.createdAt), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(customer.lastOrderDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {customer.orderCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${Number(customer.totalSpend).toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
            {(!customers || customers.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No customers found. Customers will appear here once they place an order.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
