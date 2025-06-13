
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
            products!inner (
              product_name
            )
          )
        `)
        .eq('id', selectedNotification.purchase_id)
        .single();
        
      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = {
        ...data,
        purchase_items: data.purchase_items?.map(item => ({
          quantity: item.quantity,
          product: {
            product_name: item.products.product_name
          }
        })) || []
      };
      
      return transformedData as PurchaseDetails;
    },
    enabled: !!selectedNotification?.purchase_id,
  });

  return { purchaseDetails };
}
