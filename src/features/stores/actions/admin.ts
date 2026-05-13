"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAllStores() {
  try {
    const stores = await db.store.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { stores };
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    return { error: "Failed to fetch stores" };
  }
}

export async function toggleStoreApproval(id: string, isApproved: boolean) {
  try {
    await db.store.update({
      where: { id },
      data: { isApproved },
    });
    revalidatePath("/admin/stores");
    return { success: true };
  } catch (error) {
    console.error("Failed to update store approval:", error);
    return { error: "Failed to update store approval" };
  }
}

export async function toggleStoreStatus(id: string, isActive: boolean) {
  try {
    await db.store.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/stores");
    return { success: true };
  } catch (error) {
    console.error("Failed to update store status:", error);
    return { error: "Failed to update store status" };
  }
}
