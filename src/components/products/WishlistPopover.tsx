
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

interface WishlistPopoverProps {
  isInWishlist: boolean;
  onToggleWishlist: () => void;
}

export function WishlistPopover({ isInWishlist, onToggleWishlist }: WishlistPopoverProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist-details'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          product_id,
          products (
            product_name,
            product_price,
            image
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Wishlist fetch error:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  const addToCart = async (productId: number) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('cart')
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast("Added to cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast("Failed to add to cart");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            if (!isInWishlist) {
              e.preventDefault();
              onToggleWishlist();
            }
          }}
        >
          <Heart 
            className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Wishlist</h4>
          </div>
          <div className="space-y-2 max-h-60 overflow-auto">
            {wishlistItems.map((item) => (
              <div 
                key={item.product_id} 
                className="flex items-center gap-2 p-2 border rounded-lg"
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
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => addToCart(item.product_id)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleWishlist()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {wishlistItems.length === 0 && (
            <p className="text-center text-muted-foreground">Your wishlist is empty</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
