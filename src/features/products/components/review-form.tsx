"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { createReview } from "../actions/reviews";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    startTransition(async () => {
      const result = await createReview({
        productId,
        rating,
        comment,
      });

      if (result.success) {
        toast.success("Review submitted! Thank you.");
        setComment("");
        setRating(5);
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-xl p-6 bg-card">
      <h3 className="font-bold text-lg">Leave a Review</h3>
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Your Feedback</Label>
        <Textarea
          id="comment"
          placeholder="What did you think of this item?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>
      <Button type="submit" disabled={isPending || !comment}>
        {isPending ? "Submitting..." : "Post Review"}
      </Button>
    </form>
  );
}
