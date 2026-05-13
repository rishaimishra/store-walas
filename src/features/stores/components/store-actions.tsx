"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, Power, PowerOff } from "lucide-react";
import { toggleStoreApproval, toggleStoreStatus } from "../actions/admin";
import { toast } from "sonner";
import { useTransition } from "react";

interface StoreActionsProps {
  store: {
    id: string;
    isApproved: boolean;
    isActive: boolean;
  };
}

export function StoreActions({ store }: StoreActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggleApproval = () => {
    startTransition(async () => {
      const result = await toggleStoreApproval(store.id, !store.isApproved);
      if (result.success) {
        toast.success(store.isApproved ? "Store unapproved" : "Store approved");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleStoreStatus(store.id, !store.isActive);
      if (result.success) {
        toast.success(store.isActive ? "Store suspended" : "Store activated");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleToggleApproval}>
          {store.isApproved ? (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              <span>Unapprove</span>
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Approve Store</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleStatus}>
          {store.isActive ? (
            <>
              <PowerOff className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-destructive">Suspend Store</span>
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-green-600">Activate Store</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
