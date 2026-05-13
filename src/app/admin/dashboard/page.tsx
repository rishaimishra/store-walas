import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Users, ShoppingBag, DollarSign, ShieldAlert } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminDashboard() {
  const [
    storeCount,
    userCount,
    orderCount,
    revenueResult,
    pendingStores,
    topStores,
    recentUsers
  ] = await Promise.all([
    db.store.count(),
    db.user.count(),
    db.order.count({ where: { status: { not: "CANCELLED" } } }),
    db.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { totalAmount: true }
    }),
    db.store.findMany({
        where: { isApproved: false },
        include: { owner: { select: { name: true, email: true } } },
        take: 5,
        orderBy: { createdAt: "desc" }
    }),
    db.store.findMany({
        where: { isApproved: true },
        include: {
            _count: { select: { orders: true } },
            owner: { select: { name: true } }
        },
        take: 5,
        orderBy: { orders: { _count: "desc" } }
    }),
    db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { name: true, email: true, role: true, createdAt: true }
    })
  ]);

  const totalRevenue = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) : 0;

  const stats = [
    {
      title: "Total Stores",
      value: storeCount.toString(),
      icon: Store,
      description: "Active and pending",
    },
    {
      title: "Total Users",
      value: userCount.toString(),
      icon: Users,
      description: "Sellers and customers",
    },
    {
      title: "Total Orders",
      value: orderCount.toString(),
      icon: ShoppingBag,
      description: "Successful sales",
    },
    {
      title: "Platform Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "Lifetime GMV",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Marketplace Summary</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            <CardTitle>Top Performing Stores</CardTitle>
            <CardDescription>Stores with the most orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {topStores.map((store) => (
                    <div key={store.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="space-y-1">
                            <p className="text-sm font-bold">{store.name}</p>
                            <p className="text-xs text-muted-foreground">Owner: {store.owner.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold">{store._count.orders} Orders</p>
                            <Link href="/admin/stores" className="text-[10px] text-primary hover:underline uppercase font-bold">
                                Details
                            </Link>
                        </div>
                    </div>
                ))}
                {topStores.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-10">
                        No active stores found.
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Latest users to join the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {recentUsers.map((user) => (
                    <div key={user.email} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="space-y-1">
                            <p className="text-sm font-bold">{user.name || user.email.split('@')[0]}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{user.role.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Stores waiting for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {pendingStores.map((store) => (
                    <div key={store.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="space-y-1">
                            <p className="text-sm font-bold">{store.name}</p>
                            <p className="text-xs text-muted-foreground">Owner: {store.owner.name || store.owner.email}</p>
                        </div>
                        <Link href="/admin/stores" className="text-xs font-bold text-primary hover:underline uppercase">
                            Review
                        </Link>
                    </div>
                ))}
                {pendingStores.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-10 flex flex-col items-center gap-2">
                        <ShieldAlert className="h-8 w-8 opacity-20" />
                        No stores pending approval.
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System status and logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Database</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auth Service</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
                </div>
                <div className="pt-4 border-t mt-4">
                    <p className="text-xs text-muted-foreground italic">All systems performing normally. No active incidents reported.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
