
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: any[];
  user: any;
  onEditReview: (review: any) => void;
  onDeleteReview: (reviewId: number) => void;
}

export function ReviewsModal({
  isOpen,
  onClose,
  reviews,
  user,
}: ReviewsModalProps) {
  const getAvatarLetter = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] bg-gradient-to-b from-white to-purple-50 border border-purple-100">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-800">All Reviews</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[calc(80vh-100px)] pr-4 overflow-y-auto">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No reviews yet</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border border-purple-100">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getAvatarLetter(review.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{review.user_name}</p>
                          <div className="flex mt-1">
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
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'PP')}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                      )}
                      {review.image_url && (
                        <div className="mt-3">
                          <img
                            src={review.image_url}
                            alt="Review Image"
                            className="rounded-md max-h-60 object-cover border border-gray-100 shadow-sm"
                          />
                        </div>
                      )}
                      {review.video_url && (
                        <div className="mt-3">
                          <video
                            src={review.video_url}
                            controls
                            className="rounded-md max-h-60 w-full border border-gray-100 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
