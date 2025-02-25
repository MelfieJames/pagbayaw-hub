
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";

export function useProductActions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleBuyNow = async (productId: number) => {
    if (!user) {
      toast("Please log in to purchase items");
      navigate("/login");
      return;
    }
    navigate("/checkout", { 
      state: { 
        selectedItems: [productId],
        quantities: { [productId]: 1 }
      } 
    });
  };

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
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
          quantity
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
