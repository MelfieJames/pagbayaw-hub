
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Calendar, Image as ImageIcon, Video } from "lucide-react";
import { format } from "date-fns";

interface ReviewWithDetails {
  id: number;
  rating: number;
  comment: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  user_id: string;
  product_id: number;
  product_name: string;
  user_email: string;
  user_first_name?: string;
  user_last_name?: string;
}

interface ReviewCardProps {
  review: ReviewWithDetails;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getUserDisplayName = (review: ReviewWithDetails) => {
    if (review.user_first_name || review.user_last_name) {
      return `${review.user_first_name || ''} ${review.user_last_name || ''}`.trim();
    }
    return review.user_email;
  };

  const getAvatarLetter = (review: ReviewWithDetails) => {
    const name = getUserDisplayName(review);
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border border-gray-200">
            <AvatarFallback className="bg-[#8B7355]/10 text-[#8B7355] font-semibold">
              {getAvatarLetter(review)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{getUserDisplayName(review)}</h3>
                <p className="text-sm text-gray-500">{review.user_email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </Badge>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-700">Product:</span>
                <span className="text-[#8B7355] font-medium">{review.product_name}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      review.rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({review.rating}/5)
                </span>
              </div>
            </div>

            {review.comment && (
              <div className="mb-3">
                <p className="text-gray-700 text-sm leading-relaxed">"{review.comment}"</p>
              </div>
            )}

            {(review.image_url || review.video_url) && (
              <div className="flex gap-3 mt-3">
                {review.image_url && (
                  <div className="relative">
                    <img
                      src={review.image_url}
                      alt="Review Image"
                      className="w-24 h-24 object-cover rounded-md border border-gray-200"
                    />
                    <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                      <ImageIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
                {review.video_url && (
                  <div className="relative">
                    <video
                      src={review.video_url}
                      className="w-24 h-24 object-cover rounded-md border border-gray-200"
                    />
                    <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                      <Video className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
