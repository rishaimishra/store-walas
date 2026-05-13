"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { Store } from "@prisma/client";

export type StoreWithAdminInfo = Store & {
  owner: {
    name: string | null;
    email: string;
  };
  _count: {
    products: number;
  };
};

async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  return session;
}

export async function getAllStores(): Promise<{ stores?: StoreWithAdminInfo[]; error?: string }> {
  try {
    await getAdminSession();

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
    }) as StoreWithAdminInfo[];
    return { stores };
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    return { error: "Failed to fetch stores" };
  }
}

export async function toggleStoreApproval(id: string, isApproved: boolean) {
  try {
    await getAdminSession();

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
    await getAdminSession();

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
