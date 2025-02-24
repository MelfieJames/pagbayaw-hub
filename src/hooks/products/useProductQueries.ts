
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";

export function useProductQueries() {
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
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(email),
          products(product_name, image)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return {
    products,
    inventoryData,
    productReviews
  };
}
