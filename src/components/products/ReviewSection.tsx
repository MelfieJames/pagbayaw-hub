
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, StarIcon } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ReviewSectionProps {
  productId: number;
  purchaseId?: number | null;
  purchaseItemId?: number | null;
  onSubmitReview?: () => void;
  isCompleted?: boolean;
}

export default function ReviewSection({
  productId,
  purchaseId,
  purchaseItemId,
  onSubmitReview,
  isCompleted = false,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Check if the user has already reviewed this product for this purchase
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!user || !purchaseItemId) return;

      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .eq("purchase_item_id", purchaseItemId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking existing review:", error);
          return;
        }

        if (data) {
          setHasReviewed(true);
          setExistingReview(data);
          setRating(data.rating);
          setComment(data.comment || "");
        }
      } catch (error) {
        console.error("Error checking review:", error);
      }
    };

    checkExistingReview();
  }, [user, productId, purchaseItemId]);

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: reviewData.rating,
            comment: reviewData.comment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (error) throw error;
        return { ...existingReview, ...reviewData };
      } else {
        // Create new review
        const { data, error } = await supabase
          .from("reviews")
          .insert([
            {
              user_id: reviewData.user_id,
              product_id: reviewData.product_id,
              purchase_item_id: reviewData.purchase_item_id,
              rating: reviewData.rating,
              comment: reviewData.comment,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success(
        existingReview ? "Review updated successfully!" : "Review submitted successfully!"
      );
      setHasReviewed(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      
      if (onSubmitReview) {
        onSubmitReview();
      }
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    },
  });

  const handleSubmitReview = () => {
    if (!user) {
      toast.error("Please log in to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!isCompleted) {
      toast.error("You can only review completed orders");
      return;
    }

    createReviewMutation.mutate({
      user_id: user.id,
      product_id: productId,
      purchase_item_id: purchaseItemId,
      rating,
      comment,
    });
  };

  if (!user) {
    return (
      <div className="my-4 p-4 bg-gray-50 rounded-lg border text-center">
        <p className="text-gray-600 mb-2">Please log in to leave a review</p>
      </div>
    );
  }

  if (!isCompleted) {
    return (
      <div className="my-4 p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
        <p className="text-amber-700">You can review this product once your order is completed</p>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 bg-gray-50 rounded-lg border">
      <h3 className="font-medium mb-2">
        {hasReviewed ? "Edit your review" : "Leave a review"}
      </h3>
      
      <div className="flex mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl text-gray-300 hover:text-yellow-400 focus:outline-none"
          >
            {star <= (hoverRating || rating) ? (
              <StarIcon className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="h-6 w-6" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600 self-center">
          {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select rating"}
        </span>
      </div>
      
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review here (optional)"
        rows={3}
        className="mb-3"
      />
      
      <Button 
        onClick={handleSubmitReview}
        disabled={rating === 0 || createReviewMutation.isPending}
        className="w-full md:w-auto"
      >
        {createReviewMutation.isPending
          ? "Submitting..."
          : hasReviewed
          ? "Update Review"
          : "Submit Review"}
      </Button>
    </div>
  );
}
