"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Package,
  Users,
  Settings,
  Store,
  ChevronLeft,
  LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = params.storeId as string;

  const navItems = [
    {
      title: "Overview",
      url: `/dashboard/${storeId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      url: `/dashboard/${storeId}/products`,
      icon: ShoppingBag,
    },
    {
      title: "Inventory",
      url: `/dashboard/${storeId}/inventory`,
      icon: Package,
    },
    {
      title: "Categories",
      url: `/dashboard/${storeId}/categories`,
      icon: ListOrdered,
    },
    {
      title: "Orders",
      url: `/dashboard/${storeId}/orders`,
      icon: ListOrdered,
    },
    {
      title: "Customers",
      url: `/dashboard/${storeId}/customers`,
      icon: Users,
    },
    {
      title: "Settings",
      url: `/dashboard/${storeId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Store className="h-6 w-6 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Seller Hub</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item: { title: string; url: string; icon: LucideIcon }) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground" />}>
              <ChevronLeft className="h-4 w-4" />
              <span>Switch Store</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
