import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import AdminReviewsFilters from "@/components/admin/AdminReviewsFilters";
import ReviewCard from "@/components/admin/ReviewCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Review {
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
}

interface Product {
  id: number;
  product_name: string;
  image: string | null;
}

const AdminReviewsPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    rating: "",
    product: "",
    sortBy: "newest"
  });
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all reviews with related profile and product data
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useQuery({
    queryKey: ['admin-reviews', filters],
    queryFn: async () => {
      try {
        console.log('Fetching reviews with filters:', filters);
        
        let query = supabase
          .from('reviews')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name,
              email
            ),
            products:product_id (
              product_name,
              image
            )
          `);

        // Apply filters
        if (filters.rating) {
          query = query.eq('rating', parseInt(filters.rating));
        }
        
        if (filters.product) {
          query = query.eq('product_id', parseInt(filters.product));
        }

        // Apply sorting
        if (filters.sortBy === 'oldest') {
          query = query.order('created_at', { ascending: true });
        } else if (filters.sortBy === 'highest_rating') {
          query = query.order('rating', { ascending: false });
        } else if (filters.sortBy === 'lowest_rating') {
          query = query.order('rating', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }
        
        console.log('Reviews fetched successfully:', data);
        return data as Review[];
      } catch (error) {
        console.error('Error in reviews query:', error);
        throw error;
      }
    },
  });

  // Fetch products for filter dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name, image')
        .order('product_name');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    },
  });

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleBulkDelete = async (reviewIds: number[]) => {
    if (window.confirm(`Are you sure you want to delete ${reviewIds.length} reviews?`)) {
      try {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .in('id', reviewIds);
        
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        toast.success(`${reviewIds.length} reviews deleted successfully`);
      } catch (error) {
        console.error('Error bulk deleting reviews:', error);
        toast.error('Failed to delete reviews');
      }
    }
  };

  if (reviewsError) {
    console.error('Reviews query error:', reviewsError);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="flex-1 p-8 ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Management</h1>
              <p className="text-gray-600">Manage customer reviews and feedback</p>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <AdminReviewsFilters
                filters={filters}
                onFiltersChange={setFilters}
                products={products}
              />
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviewsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : reviewsError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Error loading reviews</p>
                  <p className="text-sm text-gray-500">{reviewsError.message}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No reviews found matching your criteria
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onDelete={handleDeleteReview}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
