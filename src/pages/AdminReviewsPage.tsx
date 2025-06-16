
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminReviewsFilters } from "@/components/admin/AdminReviewsFilters";
import { ReviewCard } from "@/components/admin/ReviewCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
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
          products(product_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
      
      // Get user profiles for each review
      const reviewsWithUserData = await Promise.all(
        data.map(async (review) => {
          let userName = 'Unknown User';
          let userEmail = 'unknown@email.com';
          
          try {
            // Try to get user profile first
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', review.user_id)
              .maybeSingle();
              
            if (profileData && !profileError) {
              userName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unknown User';
              userEmail = profileData.email || 'unknown@email.com';
            } else {
              // Fallback: try to get user info from auth (admin only)
              try {
                const { data: userData } = await supabase.auth.admin.getUserById(review.user_id);
                if (userData?.user) {
                  userEmail = userData.user.email || 'unknown@email.com';
                  userName = userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'Unknown User';
                }
              } catch (authError) {
                console.log('Could not fetch user data from auth:', authError);
              }
            }
          } catch (error) {
            console.log('Error fetching user data:', error);
          }

          return {
            id: review.id,
            rating: review.rating,
            comment: review.comment || '',
            image_url: review.image_url,
            video_url: review.video_url,
            created_at: review.created_at,
            user_id: review.user_id,
            product_id: review.product_id,
            product_name: (review.products as any)?.product_name || 'Unknown Product',
            user_email: userEmail,
            user_first_name: userName.split(' ')[0],
            user_last_name: userName.split(' ').slice(1).join(' ')
          };
        })
      );
      
      return reviewsWithUserData as ReviewWithDetails[];
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

  const getReviewCount = (productId: number) => {
    return reviews.filter(r => r.product_id === productId).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#8B7355] mb-2">Reviews Management</h1>
              <p className="text-gray-600">View and monitor all product reviews from customers</p>
            </div>

            <AdminReviewsFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              products={products}
              getReviewCount={getReviewCount}
            />

            {/* Centered Admin Stats */}
            <div className="flex justify-center mb-6">
              <div className="w-full max-w-4xl">
                <AdminStats reviews={reviews} />
              </div>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-[#8B7355] rounded-full flex items-center justify-center text-white font-semibold">
                            {(review.user_first_name || 'U').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {review.user_first_name} {review.user_last_name}
                              </h3>
                              <p className="text-sm text-gray-500">{review.user_email}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium text-[#8B7355] mb-1">
                              Product: {review.product_name}
                            </p>
                            {review.comment && (
                              <p className="text-gray-700">{review.comment}</p>
                            )}
                          </div>
                          
                          {(review.image_url || review.video_url) && (
                            <div className="mt-4 flex gap-3">
                              {review.image_url && (
                                <div className="relative">
                                  <img
                                    src={review.image_url}
                                    alt="Review attachment"
                                    className="w-24 h-24 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                              {review.video_url && (
                                <div className="relative">
                                  <video
                                    src={review.video_url}
                                    className="w-24 h-24 object-cover rounded-lg border"
                                    controls
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
