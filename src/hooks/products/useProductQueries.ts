
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getProductReviews } from "@/services/productService";

export function useProductQueries() {
  const { user } = useAuth();

  // Fetch products regardless of auth status
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Products fetch error:", error);
        throw error;
      }
      return data || [];
    }
  });

  // Fetch inventory data regardless of auth status - This should already be enabled for all users
  const { data: inventoryData = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      
      if (error) {
        console.error("Inventory fetch error:", error);
        throw error;
      }
      return data || [];
    },
    // Make sure this is enabled for all users, not just logged-in users
    enabled: true
  });

  // Fetch all reviews regardless of auth status
  const { data: productReviews = [], refetch: refetchProductReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Reviews fetch error:", error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching product reviews:', error);
        return [];
      }
    }
  });
  
  // Get reviews for the current user only if logged in
  const { data: userReviews = [], isLoading: userReviewsLoading } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('id, product_id, rating, comment, image_url, video_url')
          .eq('user_id', user.id);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // This function helps determine if a user has already reviewed a specific product
  const hasUserReviewedProduct = (productId: number) => {
    if (!user) return false;
    return userReviews.some(review => review.product_id === productId);
  };
  
  // Get a specific user review for a product
  const getUserReviewForProduct = (productId: number) => {
    if (!user) return null;
    return userReviews.find(review => review.product_id === productId);
  };

  const isLoading = productsLoading || inventoryLoading || reviewsLoading;

  return {
    products,
    inventoryData,
    productReviews,
    refetchProductReviews,
    userReviews,
    hasUserReviewedProduct,
    getUserReviewForProduct,
    isLoading,
    userReviewsLoading
  };
}
