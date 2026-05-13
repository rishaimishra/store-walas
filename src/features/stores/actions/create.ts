"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const storeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export async function createStore(data: z.infer<typeof storeSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const validatedData = storeSchema.parse(data);

    // Generate slug
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug exists
    const existingStore = await db.store.findUnique({
      where: { slug },
    });

    if (existingStore) {
      return { error: "A store with this name or slug already exists" };
    }

    const store = await db.store.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        ownerId: session.user.id,
        // In a real SaaS, we might auto-approve or wait for admin
        isApproved: false,
      },
    });

    // Update user role to STORE_OWNER if they were a CUSTOMER
    if (session.user.role === "CUSTOMER") {
        await db.user.update({
            where: { id: session.user.id },
            data: { role: "STORE_OWNER" }
        });
    }

    revalidatePath("/dashboard");
    return { success: true, storeId: store.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Failed to create store:", error);
    return { error: "Failed to create store" };
  }
}
