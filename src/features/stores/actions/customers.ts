"use server";

import { db } from "@/lib/db";

export async function getStoreCustomers(storeId: string) {
  try {
    // A customer is a user who has placed at least one order in this store
    const orders = await db.order.findMany({
      where: { storeId },
      select: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          }
        },
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by customer and calculate total spend and order count
    const customerMap = new Map();

    orders.forEach((order: any) => {
      const customer = order.customer;
      if (!customerMap.has(customer.id)) {
        customerMap.set(customer.id, {
          ...customer,
          totalSpend: 0,
          orderCount: 0,
          lastOrderDate: order.createdAt,
        });
      }

      const stats = customerMap.get(customer.id);
      stats.totalSpend += Number(order.totalAmount);
      stats.orderCount += 1;

      if (new Date(order.createdAt) > new Date(stats.lastOrderDate)) {
          stats.lastOrderDate = order.createdAt;
      }
    });

    const customers = Array.from(customerMap.values());

    return { customers };
  } catch (error) {
    console.error("Failed to fetch store customers:", error);
    return { error: "Failed to fetch customers" };
  }
}
