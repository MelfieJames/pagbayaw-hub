import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, Search, User, Calendar, Image as ImageIcon, Video } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export default function AdminReviewsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          image_url,
          video_url,
          created_at,
          user_id,
          product_id,
          products!inner(product_name),
          profiles!inner(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        image_url: review.image_url,
        video_url: review.video_url,
        created_at: review.created_at,
        user_id: review.user_id,
        product_id: review.product_id,
        product_name: (review.products as any)?.product_name || '',
        user_email: (review.profiles as any)?.email || '',
        user_first_name: (review.profiles as any)?.first_name,
        user_last_name: (review.profiles as any)?.last_name
      })) as ReviewWithDetails[];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name')
        .order('product_name');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${review.user_first_name || ''} ${review.user_last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProduct = selectedProduct === "all" || review.product_id.toString() === selectedProduct;
    
    return matchesSearch && matchesProduct;
  });

  const getAverageRating = (productId: number) => {
    const productReviews = reviews.filter(r => r.product_id === productId);
    if (productReviews.length === 0) return 0;
    const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / productReviews.length).toFixed(1);
  };

  const getReviewCount = (productId: number) => {
    return reviews.filter(r => r.product_id === productId).length;
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#8B7355] mb-2">User Reviews Management</h2>
              <p className="text-gray-600">View and monitor all product reviews from customers</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by product, user, or review content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id.toString()}>
                    {product.product_name} ({getReviewCount(product.id)} reviews)
                  </option>
                ))}
              </select>
            </div>

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
                    <div className="text-2xl font-bold text-[#8B7355]">
                      {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                    </div>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Reviews with Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#8B7355]">
                    {reviews.filter(r => r.image_url || r.video_url).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">5-Star Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#8B7355]">
                    {reviews.filter(r => r.rating === 5).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review.id} className="hover:shadow-md transition-shadow">
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
                  ))}
                  
                  {filteredReviews.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No reviews found matching your criteria.
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
