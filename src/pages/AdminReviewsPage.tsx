
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminReviewsFilters } from "@/components/admin/AdminReviewsFilters";
import { ReviewCard } from "@/components/admin/ReviewCard";

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

  const getReviewCount = (productId: number) => {
    return reviews.filter(r => r.product_id === productId).length;
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

            <AdminReviewsFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              products={products}
              getReviewCount={getReviewCount}
            />

            <AdminStats reviews={reviews} />

            {isLoading ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
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
