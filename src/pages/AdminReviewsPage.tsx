
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Users, MessageSquare, Eye } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Review {
  id: number;
  rating: number;
  comment: string;
  image_url: string;
  video_url: string;
  created_at: string;
  user_id: string;
  product_id: number;
  products: {
    product_name: string;
    image: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products(product_name, image),
          profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-reviews-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating');

      if (error) throw error;

      const totalReviews = data.length;
      const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: data.filter(review => review.rating === rating).length
      }));

      return {
        totalReviews,
        averageRating,
        ratingDistribution
      };
    },
  });

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Reviews Management
              </h1>
              <p className="text-gray-600 text-lg">Monitor and manage customer reviews across all products</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Reviews</p>
                      <p className="text-3xl font-bold">{stats?.totalReviews || 0}</p>
                    </div>
                    <MessageSquare className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Average Rating</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold">{stats?.averageRating.toFixed(1) || '0.0'}</p>
                        <Star className="h-6 w-6 fill-yellow-200 text-yellow-200" />
                      </div>
                    </div>
                    <TrendingUp className="h-10 w-10 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">5 Star Reviews</p>
                      <p className="text-3xl font-bold">
                        {stats?.ratingDistribution.find(r => r.rating === 5)?.count || 0}
                      </p>
                    </div>
                    <Star className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Active Users</p>
                      <p className="text-3xl font-bold">{new Set(reviews.map(r => r.user_id)).size}</p>
                    </div>
                    <Users className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No reviews available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={review.products?.image || '/placeholder.svg'}
                                alt={review.products?.product_name}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>

                            {/* Review Content */}
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-800">
                                    {review.products?.product_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    by {review.profiles?.first_name} {review.profiles?.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{review.profiles?.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
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
                                  </div>
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    {review.rating}/5
                                  </Badge>
                                </div>
                              </div>

                              {review.comment && (
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                                  "{review.comment}"
                                </p>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>{format(new Date(review.created_at), 'PPp')}</span>
                                  {(review.image_url || review.video_url) && (
                                    <Badge variant="outline" className="text-xs">
                                      📎 Media attached
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewReview(review)}
                                  className="hover:bg-purple-50 hover:border-purple-300"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Review Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedReview.products?.image || '/placeholder.svg'}
                  alt={selectedReview.products?.product_name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedReview.products?.product_name}</h3>
                  <p className="text-gray-600">
                    {selectedReview.profiles?.first_name} {selectedReview.profiles?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedReview.profiles?.email}</p>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          selectedReview.rating >= star 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {selectedReview.comment && (
                <div>
                  <h4 className="font-medium mb-2">Comment:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedReview.comment}
                  </p>
                </div>
              )}

              {selectedReview.image_url && (
                <div>
                  <h4 className="font-medium mb-2">Image:</h4>
                  <img
                    src={selectedReview.image_url}
                    alt="Review image"
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              {selectedReview.video_url && (
                <div>
                  <h4 className="font-medium mb-2">Video:</h4>
                  <video
                    src={selectedReview.video_url}
                    controls
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              <p className="text-sm text-gray-500">
                Submitted on {format(new Date(selectedReview.created_at), 'PPP')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
