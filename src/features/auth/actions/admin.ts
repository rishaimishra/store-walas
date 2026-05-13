"use server";

import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      include: {
        _count: {
          select: {
            stores: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function updateUserRole(id: string, role: UserRole) {
  try {
    await db.user.update({
      where: { id },
      data: { role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { error: "Failed to update user role" };
  }
}
