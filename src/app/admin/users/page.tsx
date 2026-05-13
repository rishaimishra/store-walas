import { getAllUsers } from "@/features/auth/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminUsersPage() {
  const { users, error } = await getAllUsers();

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Stores</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={
                    user.role === "SUPER_ADMIN" ? "destructive" :
                    user.role === "STORE_OWNER" ? "default" : "secondary"
                  }>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user._count.stores}</TableCell>
                <TableCell>{user._count.orders}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
