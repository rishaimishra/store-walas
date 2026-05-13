import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Package, Users, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";

export default async function StoreDashboardPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  // Fetch basic stats for the store
  const [productCount, orderCount, revenueResult, recentOrders] = await Promise.all([
    db.product.count({ where: { storeId } }),
    db.order.count({ where: { storeId, status: { not: "CANCELLED" } } }),
    db.order.aggregate({
        where: { storeId, status: { not: "CANCELLED" } },
        _sum: { totalAmount: true }
    }),
    db.order.findMany({
        where: { storeId },
        include: { customer: { select: { name: true, email: true } } },
        take: 5,
        orderBy: { createdAt: "desc" }
    })
  ]);

  const totalRevenue = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) : 0;

  // Fetch real sales data for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyOrders = await db.order.findMany({
    where: {
      storeId,
      status: { not: "CANCELLED" },
      createdAt: { gte: sevenDaysAgo }
    },
    select: {
      createdAt: true,
      totalAmount: true,
    }
  });

  // Group orders by day
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesMap: Record<string, number> = {};

  // Initialize last 7 days with 0
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    salesMap[days[d.getDay()]] = 0;
  }

  dailyOrders.forEach((order: any) => {
    const day = days[new Date(order.createdAt).getDay()];
    if (salesMap[day] !== undefined) {
      salesMap[day] += Number(order.totalAmount);
    }
  });

  const salesData = Object.entries(salesMap).map(([day, amount]) => ({
    day,
    amount
  })).reverse(); // Keep chronological order (roughly, based on how we initialized)

  // Better chronological sort for the last 7 days
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      chartData.push({
          day: dayName,
          amount: salesMap[dayName] || 0
      });
  }

  const maxSales = Math.max(...chartData.map((d: any) => d.amount), 1);

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "Lifetime earnings",
    },
    {
      title: "Orders",
      value: orderCount.toString(),
      icon: ShoppingBag,
      description: "Successful transactions",
    },
    {
      title: "Products",
      value: productCount.toString(),
      icon: Package,
      description: "Active listings",
    },
    {
      title: "Avg. Order Value",
      value: orderCount > 0 ? `$${(totalRevenue / orderCount).toFixed(2)}` : "$0.00",
      icon: TrendingUp,
      description: "Per successful sale",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Store Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat: any) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Sales overview for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between gap-2 pt-10">
            {salesData.map((data: any) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                        className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm relative"
                        style={{ height: `${(data.amount / maxSales) * 100}%` }}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity border shadow-sm">
                            ${data.amount}
                        </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{data.day}</span>
                </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                          <p className="text-sm font-bold">{order.customer.name || "Customer"}</p>
                          <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-sm font-bold text-primary">${Number(order.totalAmount).toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{order.status}</p>
                      </div>
                  </div>
              ))}
              {recentOrders.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-10">
                    No orders found yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
