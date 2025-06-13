
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStatsProps {
  reviews: any[];
}

export function AdminStats({ reviews }: AdminStatsProps) {
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  const reviewsWithMedia = reviews.filter(r => r.image_url || r.video_url).length;
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#8B7355]">{reviews.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-[#8B7355]">{averageRating}</div>
            <span className="text-yellow-400">★</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Reviews with Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#8B7355]">{reviewsWithMedia}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">5-Star Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#8B7355]">{fiveStarReviews}</div>
        </CardContent>
      </Card>
    </div>
  );
}
