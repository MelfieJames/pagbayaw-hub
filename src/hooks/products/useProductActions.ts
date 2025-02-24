
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types/product";

export function useProductActions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleBuyNow = async (productId: number, products: Product[]) => {
    if (!user) {
      toast("Please log in to purchase items");
      navigate("/login");
      return;
    }

    try {
      const product = products?.find(p => p.id === productId);
      if (!product) return;

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          total_amount: product.product_price,
          status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      const { error: itemError } = await supabase
        .from('purchase_items')
        .insert({
          purchase_id: purchase.id,
          product_id: productId,
          quantity: 1,
          price_at_time: product.product_price
        });

      if (itemError) throw itemError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          purchase_id: purchase.id,
          type: 'purchase',
          message: `Your order for ${product.product_name} has been placed and is pending confirmation.`
        });

      if (notificationError) throw notificationError;

      navigate("/checkout", { state: { selectedItems: [productId] } });
      toast("Order processed successfully");
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast("Failed to process purchase. Please try again.");
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      toast("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      toast("Item added to cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast("Failed to add item to cart");
    }
  };

  return {
    handleBuyNow,
    handleAddToCart
  };
}
