import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { CartItem } from "@/types/product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type SupabaseCartResponse = {
  quantity: number;
  product_id: number;
  products: {
    product_name: string;
    product_price: number;
    image: string | null;
    category: string;
  };
};

export function CartPopover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ['cart-details'],
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
            image,
            category
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
          image: item.products.image,
          category: item.products.category
        }
      }));
    },
    enabled: !!user?.id
  });

  // Always fetch inventory data regardless of login status
  const { data: inventoryData = [] } = useQuery({
    queryKey: ['inventory-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
        
      if (error) throw error;
      return data;
    },
    enabled: true // Always enabled to ensure inventory data is available for all users
  });
  
  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (!user?.id) {
      toast("Please log in to update your cart");
      navigate('/login', {
        state: {
          redirectAfterLogin: '/products',
          message: "Please log in to manage your cart"
        }
      });
      return;
    }
    const inventoryItem = inventoryData.find(item => item.product_id === productId);
    const maxQuantity = inventoryItem?.quantity || 0;
    if (newQuantity > maxQuantity) {
      toast("Cannot exceed available stock");
      return;
    }
    if (newQuantity < 1) return;
    try {
      const {
        error
      } = await supabase.from('cart').update({
        quantity: newQuantity
      }).eq('user_id', user.id).eq('product_id', productId);
      if (error) throw error;
      queryClient.invalidateQueries({
        queryKey: ['cart-details']
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast("Failed to update quantity");
    }
  };
  
  const removeFromCart = async (productId: number) => {
    if (!user?.id) {
      toast("Please log in to remove items from your cart");
      navigate('/login', {
        state: {
          redirectAfterLogin: '/products',
          message: "Please log in to manage your cart"
        }
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId);
      if (error) throw error;
      setSelectedItems(prev => prev.filter(id => id !== productId));
      queryClient.invalidateQueries({
        queryKey: ['cart-details']
      });
      toast("Item removed from cart");
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast("Failed to remove item from cart");
    }
  };
  
  const toggleItemSelection = (productId: number) => {
    setSelectedItems(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const groupedCartItems = cartItems.reduce((acc, item) => {
    const category = item.products?.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const selectedTotal = cartItems
    .filter(item => selectedItems.includes(item.product_id))
    .reduce((sum, item) => sum + item.quantity * (item.products?.product_price || 0), 0);

  const handleCheckout = () => {
    if (!user) {
      toast("Please log in to checkout");
      navigate('/login', {
        state: {
          redirectAfterLogin: '/products',
          message: "Please log in to checkout"
        }
      });
      return;
    }
    if (selectedItems.length === 0) {
      toast("Please select items to checkout");
      return;
    }
    const quantities = cartItems
      .filter(item => selectedItems.includes(item.product_id))
      .reduce((acc, item) => ({
        ...acc,
        [item.product_id]: item.quantity
      }), {});
    navigate('/checkout', {
      state: {
        selectedItems,
        quantities
      }
    });
  };

  const handleNavigateToProducts = () => {
    navigate('/products');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mx-[5px]">
          <ShoppingCart className="h-5 w-5" />
          {user && cartItems.length > 0 && (
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
            {user && (
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} selected
              </span>
            )}
          </div>
          
          {!user ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-muted-foreground">Please log in to view your cart</p>
              <Button 
                className="w-full" 
                onClick={() => navigate('/login', {
                  state: {
                    redirectAfterLogin: '/products',
                    message: "Please log in to view your cart"
                  }
                })}
              >
                Log In
              </Button>
              <Button variant="outline" className="w-full" onClick={handleNavigateToProducts}>
                Browse Products
              </Button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button className="w-full" onClick={handleNavigateToProducts}>
                Browse Products
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                {Object.entries(groupedCartItems).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h5 className="font-medium text-sm text-muted-foreground">{category}</h5>
                    {items.map(item => (
                      <div key={item.product_id} className="flex items-start gap-2 p-2 border rounded-lg animate-in fade-in-0 zoom-in-95">
                        <Checkbox 
                          checked={selectedItems.includes(item.product_id)} 
                          onCheckedChange={() => toggleItemSelection(item.product_id)} 
                          className="mt-2" 
                        />
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
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Selected Total:</span>
                  <span className="font-medium">₱{selectedTotal.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCheckout} 
                  disabled={selectedItems.length === 0}
                >
                  Proceed to Checkout ({selectedItems.length} items)
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
