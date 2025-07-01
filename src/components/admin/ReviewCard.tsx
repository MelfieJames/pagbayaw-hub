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
        className={`w-5 h-5 transition-colors duration-200 ${
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
    <Card className="w-full bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-2xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          {review.products?.image && (
            <img
              src={review.products.image}
              alt={review.products.product_name}
              className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm"
            />
          )}
          <div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight">
              {review.products?.product_name || 'Unknown Product'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span>{getUserName()}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
              <Calendar className="w-4 h-4 text-gray-300" />
              <span>
                {format(new Date(review.created_at), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-yellow-50 border-yellow-300 text-yellow-700 font-semibold text-base shadow-sm">
            <div className="flex">{renderStars(review.rating)}</div>
            <span className="ml-2">{review.rating}/5</span>
          </Badge>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(review.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs shadow hover:scale-105 transition-transform"
            aria-label="Delete review"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
      <CardContent className="p-6">
        {/* Review Comment */}
        {review.comment && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-base font-medium text-gray-700">Review Comment</span>
            </div>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-xl border-l-4 border-yellow-300 shadow-sm">
              {review.comment}
            </p>
          </div>
        )}
        {/* Review Media */}
        <div className="flex flex-wrap gap-6">
          {review.image_url && (
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700 mb-2">Review Image</p>
              <img
                src={review.image_url}
                alt="Review"
                className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-md hover:scale-105 transition-transform"
              />
            </div>
          )}
          {review.video_url && (
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700 mb-2">Review Video</p>
              <video
                src={review.video_url}
                controls
                className="w-56 h-32 rounded-xl border border-gray-200 shadow-md hover:scale-105 transition-transform"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
