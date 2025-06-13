
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Notification, PurchaseDetails } from "../types";

export function usePurchaseDetails(selectedNotification: Notification | null) {
  const { data: purchaseDetails } = useQuery({
    queryKey: ['purchase-details', selectedNotification?.purchase_id],
    queryFn: async () => {
      if (!selectedNotification?.purchase_id) return null;
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          total_amount,
          created_at,
          purchase_items (
            quantity,
            products (
              product_name
            )
          )
        `)
        .eq('id', selectedNotification.purchase_id)
        .single();
        
      if (error) throw error;
      
      // Transform the data to match our interface
      // Supabase returns products as an array, but we need a single object
      const transformedData = {
        ...data,
        purchase_items: data.purchase_items?.map(item => ({
          quantity: item.quantity,
          products: Array.isArray(item.products) ? item.products[0] : item.products
        })) || []
      };
      
      return transformedData as PurchaseDetails;
    },
    enabled: !!selectedNotification?.purchase_id,
  });

  return { purchaseDetails };
}
