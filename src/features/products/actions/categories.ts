"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function getCategories(storeId: string) {
  try {
    const categories = await db.category.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: "asc" },
    });
    return { categories };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { error: "Failed to fetch categories" };
  }
}

export async function createCategory(storeId: string, data: z.infer<typeof categorySchema>) {
  try {
    const validatedData = categorySchema.parse(data);

    // Generate slug
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const category = await db.category.create({
      data: {
        name: validatedData.name,
        slug,
        storeId,
      },
    });

    revalidatePath(`/dashboard/${storeId}/categories`);
    return { success: true, category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error("Failed to create category:", error);
    return { error: "Failed to create category" };
  }
}

export async function deleteCategory(storeId: string, categoryId: string) {
  try {
    // Check if category has products
    const productCount = await db.product.count({
      where: { categoryId }
    });

    if (productCount > 0) {
      return { error: "Cannot delete category with associated products" };
    }

    await db.category.delete({
      where: { id: categoryId, storeId },
    });
    revalidatePath(`/dashboard/${storeId}/categories`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { error: "Failed to delete category" };
  }
}
