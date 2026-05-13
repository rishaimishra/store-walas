"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { Order, Prisma } from "@prisma/client";

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  storeId: string;
}

export type OrderWithStore = Order & {
  store: { name: string };
  _count: { items: number };
};

export async function createOrder(data: {
  items: OrderItem[];
  shippingAddress: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Please login to place an order" };
    }

    if (data.items.length === 0) {
      return { error: "Your cart is empty" };
    }

    // Group items by store (since one order can contain items from multiple stores)
    // In a more complex multi-vendor app, we might create multiple sub-orders
    // For this MVP, we'll create one order per store to make management easier for owners

    const storeIds = [...new Set(data.items.map((item: OrderItem) => item.storeId))];
    const createdOrders: { id: string }[] = [];

    // Use a transaction to ensure all orders are created and stock is updated atomically
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const storeId of storeIds) {
        const storeItems = data.items.filter((item: OrderItem) => item.storeId === storeId);
        const storeTotal = storeItems.reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0);
        const orderNumber = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        // 1. Update stock for each item
        for (const item of storeItems) {
          if (item.variantId) {
            // Update variant stock
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              select: { stock: true }
            });

            if (!variant || variant.stock < item.quantity) {
              throw new Error(`Insufficient stock for one or more items.`);
            }

            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } }
            });
          } else {
            // Update base product stock
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true }
            });

            if (!product || product.stock < item.quantity) {
              throw new Error(`Insufficient stock for one or more items.`);
            }

            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } }
            });
          }
        }

        // 2. Create the order
        const order = await tx.order.create({
          data: {
            orderNumber,
            totalAmount: storeTotal,
            storeId,
            customerId: session.user.id,
            shippingAddress: data.shippingAddress,
            items: {
              create: storeItems.map((item: OrderItem) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });
        createdOrders.push(order);
      }
    });

    revalidatePath("/orders");
    return { success: true, orderIds: createdOrders.map((o: { id: string }) => o.id) };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { error: "Failed to place order. Please try again." };
  }
}

export async function getCustomerOrders(): Promise<{ orders?: OrderWithStore[]; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { error: "Unauthorized" };

    const orders = await db.order.findMany({
      where: { customerId: session.user.id },
      include: {
        store: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as OrderWithStore[];

    return { orders };
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    return { error: "Failed to fetch orders" };
  }
}
