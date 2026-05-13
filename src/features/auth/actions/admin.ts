"use server";

import { db } from "@/lib/db";
import { UserRole, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  return session;
}

export type UserWithStats = User & {
  _count: {
    stores: number;
    orders: number;
  };
};

export async function getAllUsers(): Promise<{ users?: UserWithStats[]; error?: string }> {
  try {
    await getAdminSession();
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
    }) as UserWithStats[];
    return { users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function updateUserRole(id: string, role: UserRole) {
  try {
    await getAdminSession();
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
