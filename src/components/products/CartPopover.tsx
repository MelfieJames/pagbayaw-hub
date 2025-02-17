
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

interface CartPopoverProps {
  isInCart: boolean;
  onAddToCart: () => void;
}

interface CartResponse {
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
      const { data, error } = await supabase
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
        .eq('user_id', user.id);

      if (error) {
        console.error('Cart fetch error:', error);
        return [];
      }
      
      return (data || []).map((item: CartResponse) => ({
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
          variant={isInCart ? "secondary" : "default"}
          size="icon"
          onClick={(e) => {
            if (!isInCart) {
              e.preventDefault();
              onAddToCart();
            }
          }}
        >
          <ShoppingCart className="h-4 w-4" />
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
          <div className="space-y-2 max-h-60 overflow-auto">
            {cartItems.map((item) => (
              <div 
                key={item.product_id} 
                className="flex items-center gap-2 p-2 border rounded-lg"
              >
                <Checkbox />
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
                    ₱{item.products?.product_price.toFixed(2)} × {item.quantity}
                  </p>
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
