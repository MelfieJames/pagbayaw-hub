
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    email: string;
  };
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  reviews: Review[];
}

export const ReviewsModal = ({ isOpen, onClose, productName, reviews }: ReviewsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reviews for {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{review.profiles.email}</p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            review.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), 'PP')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
