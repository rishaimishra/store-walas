"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const storeSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bannerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function getStore(storeId: string) {
  try {
    const store = await db.store.findUnique({
      where: { id: storeId },
    });
    return { store };
  } catch (error) {
    console.error("Failed to fetch store:", error);
    return { error: "Failed to fetch store" };
  }
}

export async function updateStoreSettings(storeId: string, data: z.infer<typeof storeSettingsSchema>) {
  try {
    const validatedData = storeSettingsSchema.parse(data);

    await db.store.update({
      where: { id: storeId },
      data: validatedData,
    });

    revalidatePath(`/dashboard/${storeId}/settings`);
    revalidatePath(`/dashboard/${storeId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Failed to update store settings:", error);
    return { error: "Failed to update store settings" };
  }
}
