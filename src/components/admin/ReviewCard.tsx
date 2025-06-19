
import { format } from "date-fns";
import { Star, Trash2, User, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    comment: string | null;
    image_url: string | null;
    video_url: string | null;
    created_at: string;
    user_id: string;
    product_id: number;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email: string;
    } | null;
    products: {
      product_name: string;
      image: string | null;
    } | null;
  };
  onDelete: (reviewId: number) => Promise<void>;
}

export default function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getUserName = () => {
    if (review.profiles?.first_name || review.profiles?.last_name) {
      return `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim();
    }
    return review.profiles?.email || 'Anonymous User';
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            {/* Product Image */}
            {review.products?.image && (
              <img
                src={review.products.image}
                alt={review.products.product_name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {review.products?.product_name || 'Unknown Product'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{getUserName()}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {format(new Date(review.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className="flex">{renderStars(review.rating)}</div>
              <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
            </Badge>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(review.id)}
              className="flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Review Comment */}
        {review.comment && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Review Comment</span>
            </div>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border-l-4 border-[#8B7355]">
              {review.comment}
            </p>
          </div>
        )}

        {/* Review Media */}
        <div className="flex space-x-4">
          {review.image_url && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Review Image</p>
              <img
                src={review.image_url}
                alt="Review"
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>
          )}
          
          {review.video_url && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Review Video</p>
              <video
                src={review.video_url}
                controls
                className="w-48 h-24 rounded-lg border"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
