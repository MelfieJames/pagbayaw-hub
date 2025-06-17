
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Image as ImageIcon, Video, Trash2, User } from "lucide-react";
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
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  products?: {
    product_name: string;
    image: string;
  } | null;
}

interface ReviewCardProps {
  review: ReviewWithDetails;
  onDelete: (reviewId: number) => Promise<void>;
}

export function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const getUserDisplayName = (review: ReviewWithDetails) => {
    if (review.profiles?.first_name || review.profiles?.last_name) {
      return `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim();
    }
    return review.profiles?.email || 'Unknown User';
  };

  const getAvatarLetter = (review: ReviewWithDetails) => {
    const name = getUserDisplayName(review);
    return name && name !== 'Unknown User' ? name.charAt(0).toUpperCase() : 'U';
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await onDelete(review.id);
    }
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
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {getUserDisplayName(review)}
                </h3>
                <p className="text-sm text-gray-500">{review.profiles?.email || 'No email'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-700">Product:</span>
                <span className="text-[#8B7355] font-medium">
                  {review.products?.product_name || 'Unknown Product'}
                </span>
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
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-md">
                  "{review.comment}"
                </p>
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
