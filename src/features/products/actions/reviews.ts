"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  productId: z.string(),
});

export async function createReview(data: z.infer<typeof reviewSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "You must be logged in to leave a review" };
    }

    const validatedData = reviewSchema.parse(data);

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
        where: {
            userId: session.user.id,
            productId: validatedData.productId
        }
    });

    if (existingReview) {
        return { error: "You have already reviewed this product" };
    }

    const review = await db.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        productId: validatedData.productId,
        userId: session.user.id,
      },
      include: {
          product: { select: { store: { select: { slug: true } }, slug: true } }
      }
    });

    revalidatePath(`/${review.product.store.slug}/products/${review.product.slug}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error("Failed to create review:", error);
    return { error: "Failed to submit review" };
  }
}
