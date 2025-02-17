
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { CartItem } from "@/types/product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

interface CartPopoverProps {
  isInCart: boolean;
  onAddToCart: () => void;
}

type SupabaseCartResponse = {
  quantity: number;
  product_id: number;
  products: {
    product_name: string;
    product_price: number;
    image: string | null;
  };
}

export function CartPopover({ isInCart, onAddToCart }: CartPopoverProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: responseData, error } = await supabase
        .from('cart')
        .select(`
          quantity,
          product_id,
          products (
            product_name,
            product_price,
            image
          )
        `)
        .eq('user_id', user.id)
        .returns<SupabaseCartResponse[]>();

      if (error) {
        console.error('Cart fetch error:', error);
        return [];
      }
      
      return responseData.map(item => ({
        quantity: item.quantity,
        product_id: item.product_id,
        products: {
          product_name: item.products.product_name,
          product_price: item.products.product_price,
          image: item.products.image
        }
      }));
    },
    enabled: !!user?.id
  });

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (!user?.id || newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast("Failed to update quantity");
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast("Item removed from cart");
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast("Failed to remove item from cart");
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.quantity * (item.products?.product_price || 0));
  }, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          className="relative"
          onClick={(e) => {
            if (!isInCart) {
              e.preventDefault();
              onAddToCart();
            }
          }}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {cartItems.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Shopping Cart</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/cart')}
            >
              View Cart
            </Button>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {cartItems.map((item) => (
              <div 
                key={item.product_id} 
                className="flex items-center gap-2 p-2 border rounded-lg animate-in fade-in-0 zoom-in-95"
              >
                <img 
                  src={item.products?.image || "/placeholder.svg"} 
                  alt={item.products?.product_name} 
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.products?.product_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ₱{item.products?.product_price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.product_id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {cartItems.length > 0 ? (
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-medium">₱{total.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => navigate('/cart')}>
                Proceed to Checkout
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Your cart is empty</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
