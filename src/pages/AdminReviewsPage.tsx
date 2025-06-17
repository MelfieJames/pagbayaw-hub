
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { AdminReviewsFilters } from "@/components/admin/AdminReviewsFilters";
import { ReviewCard } from "@/components/admin/ReviewCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import { Star } from "lucide-react";

export default function AdminReviewsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    rating: "",
    product: "",
    sortBy: "newest"
  });

  const { data: reviews = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reviews', filters],
    queryFn: async () => {
      console.log("Fetching reviews with filters:", filters);
      
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_user_id_fkey (
            first_name,
            last_name,
            email
          ),
          products!reviews_product_id_fkey (
            product_name,
            image
          )
        `);

      // Apply rating filter
      if (filters.rating) {
        query = query.eq('rating', parseInt(filters.rating));
      }

      // Apply product filter
      if (filters.product) {
        query = query.eq('product_id', filters.product);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }

      console.log("Reviews fetched successfully:", data?.length || 0);
      return data || [];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name')
        .order('product_name');

      if (error) throw error;
      return data || [];
    }
  });

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      refetch();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex pt-16">
          <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
            <div className="text-center text-red-600">
              <p>Error loading reviews: {error.message}</p>
              <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#8B7355] mb-2 flex items-center gap-2">
                <Star className="h-8 w-8" />
                Reviews Management
              </h1>
              <p className="text-gray-600">Manage customer reviews and ratings</p>
            </div>

            <AdminReviewsFilters
              filters={filters}
              onFiltersChange={setFilters}
              products={products}
            />

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-500">No reviews match your current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
