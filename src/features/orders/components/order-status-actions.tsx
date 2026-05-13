"use client";

import { Button } from "@/components/ui/button";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "../actions/store";
import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Truck, PackageCheck, XCircle, LucideIcon } from "lucide-react";

interface OrderStatusActionsProps {
  order: {
    id: string;
    storeId: string;
    status: OrderStatus;
  };
}

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (status: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.storeId, order.id, status);
      if (result.success) {
        toast.success(`Order status updated to ${status}`);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const statuses: { label: string; value: OrderStatus; icon: LucideIcon; color: string }[] = [
    { label: "Processing", value: "PROCESSING", icon: PackageCheck, color: "text-blue-600" },
    { label: "Shipped", value: "SHIPPED", icon: Truck, color: "text-purple-600" },
    { label: "Delivered", value: "DELIVERED", icon: Check, color: "text-green-600" },
    { label: "Cancel", value: "CANCELLED", icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 gap-2">
      {statuses
        .filter((s: { label: string; value: OrderStatus; icon: LucideIcon; color: string }) => s.value !== order.status)
        .map((s: { label: string; value: OrderStatus; icon: LucideIcon; color: string }) => (
          <Button
            key={s.value}
            variant="outline"
            className="justify-start gap-2 h-10"
            disabled={isPending}
            onClick={() => handleStatusUpdate(s.value)}
          >
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <span>Mark as {s.label}</span>
          </Button>
        ))}
    </div>
  );
}
