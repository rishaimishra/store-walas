"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function verifyStoreOwnership(storeId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized: Please log in");
  }

  const store = await db.store.findUnique({
    where: { id: storeId, ownerId: session.user.id },
  });

  if (!store && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: You do not own this store");
  }

  return { session, store };
}

export async function getStoreOrders(storeId: string) {
  try {
    await verifyStoreOwnership(storeId);

    const orders = await db.order.findMany({
      where: { storeId },
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { orders };
  } catch (error) {
    console.error("Failed to fetch store orders:", error);
    return { error: "Failed to fetch orders" };
  }
}

export async function updateOrderStatus(storeId: string, orderId: string, status: OrderStatus) {
  try {
    await verifyStoreOwnership(storeId);

    await db.order.update({
      where: { id: orderId, storeId },
      data: { status },
    });
    revalidatePath(`/dashboard/${storeId}/orders`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { error: "Failed to update order status" };
  }
}

export async function getStoreOrder(storeId: string, orderId: string) {
  try {
    await verifyStoreOwnership(storeId);

    const order = await db.order.findUnique({
      where: { id: orderId, storeId },
      include: {
        customer: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, images: { take: 1 } } },
            variant: true,
          }
        }
      },
    });
    return { order };
  } catch (error) {
    console.error("Failed to fetch store order:", error);
    return { error: "Failed to fetch order details" };
  }
}
