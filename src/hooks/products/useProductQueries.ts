
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getProductReviews } from "@/services/productService";

export function useProductQueries() {
  const { user } = useAuth();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: productReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles(email, id)
          `)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching product reviews:', error);
        return [];
      }
    }
  });
  
  // Get reviews for the current user to check if they've already reviewed products
  const { data: userReviews = [] } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('product_id, id')
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
    return userReviews.some(review => review.product_id === productId);
  };
  
  // Get a specific user review for a product
  const getUserReviewForProduct = (productId: number) => {
    return userReviews.find(review => review.product_id === productId);
  };

  return {
    products,
    inventoryData,
    productReviews,
    userReviews,
    hasUserReviewedProduct,
    getUserReviewForProduct
  };
}
