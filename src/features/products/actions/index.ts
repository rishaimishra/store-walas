"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional(),
  variants: z.array(z.object({
      size: z.string().optional(),
      color: z.string().optional(),
      stock: z.coerce.number().int().nonnegative(),
      price: z.coerce.number().optional(),
  })).optional(),
});

export async function getProducts(storeId: string) {
  try {
    const products = await db.product.findMany({
      where: { storeId },
      include: {
        category: true,
        images: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { products };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { error: "Failed to fetch products" };
  }
}

export async function createProduct(storeId: string, data: z.infer<typeof productSchema>) {
  try {
    const validatedData = productSchema.parse(data);

    // Generate slug
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const product = await db.product.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        stock: validatedData.stock,
        storeId,
        categoryId: validatedData.categoryId,
        images: {
          create: validatedData.images?.map((url, index) => ({
            url,
            order: index,
          })),
        },
        variants: {
            create: validatedData.variants?.map(v => ({
                size: v.size,
                color: v.color,
                stock: v.stock,
                price: v.price,
            }))
        }
      },
    });

    revalidatePath(`/dashboard/${storeId}/products`);
    return { success: true, product };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Failed to create product:", error);
    return { error: "Failed to create product" };
  }
}

export async function getProduct(storeId: string, productId: string) {
  try {
    const product = await db.product.findUnique({
      where: { id: productId, storeId },
      include: {
        images: true,
        variants: true,
      },
    });
    return { product };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return { error: "Failed to fetch product" };
  }
}

export async function updateProduct(
  storeId: string,
  productId: string,
  data: z.infer<typeof productSchema>
) {
  try {
    const validatedData = productSchema.parse(data);

    // Update product and its images/variants
    await db.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: { productId },
      });

      await tx.productVariant.deleteMany({
          where: { productId }
      });

      await tx.product.update({
        where: { id: productId, storeId },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          price: validatedData.price,
          stock: validatedData.stock,
          categoryId: validatedData.categoryId,
          images: {
            create: validatedData.images?.map((url, index) => ({
              url,
              order: index,
            })),
          },
          variants: {
              create: validatedData.variants?.map(v => ({
                  size: v.size,
                  color: v.color,
                  stock: v.stock,
                  price: v.price,
              }))
          }
        },
      });
    });

    revalidatePath(`/dashboard/${storeId}/products`);
    revalidatePath(`/dashboard/${storeId}/products/${productId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Failed to update product:", error);
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(storeId: string, productId: string) {
  try {
    await db.product.delete({
      where: { id: productId, storeId },
    });

    revalidatePath(`/dashboard/${storeId}/products`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { error: "Failed to delete product" };
  }
}
