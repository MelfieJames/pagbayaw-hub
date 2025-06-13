
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ProductReviewsProps {
  productId: number;
  productReviews: any[];
  refetchProductReviews: () => void;
}

export function ProductReviews({ productId, productReviews, refetchProductReviews }: ProductReviewsProps) {
  const { user } = useAuth();
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productSpecificReviews = productReviews.filter(review => review.product_id === productId);

  const handleSubmitReview = async () => {
    if (!user || !newReview.trim() || newRating === 0) return;

    try {
      setIsSubmitting(true);
      // Review submission logic would go here
      // For now, just call the refetch function
      refetchProductReviews();
      setNewReview("");
      setNewRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Customer Reviews</h4>
      
      {user && (
        <Card className="border border-gray-200">
          <CardHeader>
            <h5 className="font-medium">Write a Review</h5>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className={`p-1 ${newRating >= star ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star className="h-4 w-4" fill={newRating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience with this product..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || !newReview.trim() || newRating === 0}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {productSpecificReviews.length > 0 ? (
          productSpecificReviews.map((review) => (
            <Card key={review.id} className="border border-gray-100">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Anonymous User</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              review.rating >= star ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                    {review.image_url && (
                      <img
                        src={review.image_url}
                        alt="Review"
                        className="h-24 w-24 object-cover rounded-md"
                      />
                    )}
                    {review.video_url && (
                      <video
                        src={review.video_url}
                        controls
                        className="h-24 w-auto rounded-md"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
}
