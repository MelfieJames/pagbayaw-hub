import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import Navbar from "@/components/Navbar";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Star, Search, TrendingUp, MessageSquare, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Review {
  id: number;
  user_id: string;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
  image_url?: string;
  video_url?: string;
  products?: {
    product_name: string;
    image: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products (product_name, image),
          profiles (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = review.products?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           `${review.profiles?.first_name} ${review.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = filterRating === "all" || review.rating.toString() === filterRating;
      
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, filterRating]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }, [reviews]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#8B7355] mb-2">Reviews Management</h1>
              <p className="text-gray-600">Monitor and manage customer reviews and feedback</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="border-[#C4A484]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                      <p className="text-2xl font-bold text-[#8B7355]">{reviews.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-[#8B7355]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#C4A484]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-[#8B7355]">{averageRating.toFixed(1)}</p>
                        <div className="flex">
                          {renderStars(Math.round(averageRating))}
                        </div>
                      </div>
                    </div>
                    <Star className="h-8 w-8 text-[#8B7355]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#C4A484]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                      <p className="text-2xl font-bold text-[#8B7355]">{ratingDistribution[5]}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-[#8B7355]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#C4A484]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-[#8B7355]">
                        {reviews.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-[#8B7355]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-[#C4A484]">
              <CardHeader className="bg-[#F5F5DC]">
                <CardTitle className="text-[#8B7355]">Filter Reviews</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-64">
                    <Input
                      placeholder="Search by product, customer, or comment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <Card className="border-[#C4A484]">
              <CardHeader className="bg-[#F5F5DC]">
                <CardTitle className="text-[#8B7355]">Customer Reviews ({filteredReviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-3" />
                    <p>No reviews found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredReviews.map((review) => (
                      <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-4">
                          {review.products?.image && (
                            <img
                              src={review.products.image}
                              alt={review.products.product_name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-[#8B7355] text-lg">
                                  {review.products?.product_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  by {review.profiles?.first_name} {review.profiles?.last_name}
                                  <span className="mx-2">•</span>
                                  {format(new Date(review.created_at), "MMM d, yyyy")}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                                <Badge 
                                  className={
                                    review.rating >= 4 
                                      ? "bg-green-100 text-green-800" 
                                      : review.rating >= 3 
                                      ? "bg-yellow-100 text-yellow-800" 
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {review.rating} Star{review.rating !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {review.comment}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewReviewDetails(review)}
                                className="border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              {(review.image_url || review.video_url) && (
                                <Badge variant="outline" className="border-[#8B7355] text-[#8B7355]">
                                  Media Attached
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Review Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#8B7355]">Review Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  {selectedReview.products?.image && (
                    <img
                      src={selectedReview.products.image}
                      alt={selectedReview.products.product_name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#8B7355]">
                      {selectedReview.products?.product_name}
                    </h3>
                    <p className="text-gray-600">
                      Review by {selectedReview.profiles?.first_name} {selectedReview.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(selectedReview.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(selectedReview.rating)}
                  </div>
                  <span className="font-semibold text-[#8B7355]">
                    {selectedReview.rating} out of 5 stars
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-[#8B7355] mb-2">Comment:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedReview.comment}
                  </p>
                </div>
                
                {selectedReview.image_url && (
                  <div>
                    <h4 className="font-medium text-[#8B7355] mb-2">Attached Image:</h4>
                    <img
                      src={selectedReview.image_url}
                      alt="Review attachment"
                      className="max-w-full h-auto rounded-md"
                    />
                  </div>
                )}
                
                {selectedReview.video_url && (
                  <div>
                    <h4 className="font-medium text-[#8B7355] mb-2">Attached Video:</h4>
                    <video
                      src={selectedReview.video_url}
                      controls
                      className="max-w-full h-auto rounded-md"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
