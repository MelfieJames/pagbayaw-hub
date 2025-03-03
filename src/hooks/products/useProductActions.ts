
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
      navigate("/login", { 
        state: { 
          redirectAfterLogin: "/products",
          message: "Please log in to continue with your purchase."
        } 
      });
      return;
    }

    try {
      // Get inventory quantity first
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .single();

      if (inventoryError) throw inventoryError;

      if (!inventoryData || inventoryData.quantity < 1) {
        toast("Item is out of stock");
        return;
      }

      // Add to cart with quantity of 1
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });

      if (error) throw error;

      // Navigate to checkout with the selected item
      navigate("/checkout", { 
        state: { 
          selectedItems: [productId],
          quantities: { [productId]: 1 }
        } 
      });
    } catch (error) {
      console.error('Error processing buy now:', error);
      toast("Failed to process buy now request");
    }
  };

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      toast("Please log in to add items to cart");
      navigate("/login", { 
        state: { 
          redirectAfterLogin: "/products",
          message: "Please log in to add items to your cart."
        } 
      });
      return;
    }

    try {
      // Get inventory quantity first
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .single();

      if (inventoryError) throw inventoryError;

      if (!inventoryData || inventoryData.quantity < 1) {
        toast("Item is out of stock");
        return;
      }

      // Check existing cart quantity
      const { data: existingItem, error: checkError } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Ensure we don't exceed inventory
      if (newQuantity > inventoryData.quantity) {
        toast("Cannot exceed available stock");
        return;
      }

      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity: newQuantity
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
