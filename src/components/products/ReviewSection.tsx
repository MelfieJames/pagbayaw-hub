
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    email: string;
  };
  products: {
    product_name: string;
    category: string;
    image: string | null;
  };
}

interface ReviewSectionProps {
  reviews: Review[];
}

export const ReviewSection = ({ reviews }: ReviewSectionProps) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Group reviews by product to calculate averages
  const productStats = reviews.reduce((acc, review) => {
    if (!acc[review.product_id]) {
      acc[review.product_id] = {
        count: 0,
        totalRating: 0
      };
    }
    acc[review.product_id].count++;
    acc[review.product_id].totalRating += review.rating;
    return acc;
  }, {} as Record<number, { count: number; totalRating: number }>);

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-semibold mb-6">Recent Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <div className="flex items-start p-4">
              <div className="w-24 h-24 flex-shrink-0 mr-4">
                <img
                  src={review.products.image || "/placeholder.svg"}
                  alt={review.products.product_name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <CardHeader className="p-0">
                  <CardTitle className="text-base truncate">
                    {review.products.product_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="mt-1 mb-2">
                      {review.products.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {productStats[review.product_id].count} reviews
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          review.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {review.comment}
                      </p>
                      {review.comment.length > 150 && (
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                        >
                          See More
                          <MessageSquare className="h-4 w-4 ml-1" />
                        </button>
                      )}
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(review.created_at), 'PP')} by {review.profiles.email}
                  </p>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReview.products.product_name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedReview.products.image || "/placeholder.svg"}
                    alt={selectedReview.products.product_name}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div>
                    <Badge variant="secondary">{selectedReview.products.category}</Badge>
                    <div className="flex space-x-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            selectedReview.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(selectedReview.created_at), 'PPP')} by {selectedReview.profiles.email}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">{selectedReview.comment}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
