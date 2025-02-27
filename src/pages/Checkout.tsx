
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { CartItem } from "@/types/product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

type SupabaseCartResponse = {
  quantity: number;
  product_id: number;
  products: {
    product_name: string;
    product_price: number;
    image: string | null;
    category: string;
  };
}

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const selectedItems = location.state?.selectedItems || [];
  const selectedQuantities = location.state?.quantities || {};

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const { data: cartItems = [], refetch } = useQuery({
    queryKey: ['checkout-items', selectedItems],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // If no selected items, get all cart items
      let query = supabase
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
        .eq('user_id', user.id);

      // If we have selected items, filter by them
      if (selectedItems.length > 0) {
        query = query.in('product_id', selectedItems);
      }

      const { data: responseData, error } = await query
        .returns<SupabaseCartResponse[]>();

      if (error) {
        console.error('Cart fetch error:', error);
        return [];
      }
      
      const items = responseData.map(item => ({
        quantity: selectedQuantities[item.product_id] || item.quantity,
        product_id: item.product_id,
        products: {
          product_name: item.products.product_name,
          product_price: item.products.product_price,
          image: item.products.image,
          category: item.products.category
        }
      }));

      return items as CartItem[];
    },
    enabled: !!user?.id,
    staleTime: Infinity,
  });

  // Add inventory query
  const { data: inventoryData = [] } = useQuery({
    queryKey: ['inventory-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (!user?.id || newQuantity < 1) return;

    // Check inventory limits
    const inventoryItem = inventoryData.find(item => item.product_id === productId);
    const maxQuantity = inventoryItem?.quantity || 0;

    if (newQuantity > maxQuantity) {
      toast.error("Cannot exceed available stock");
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      refetch();
      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      toast.success("Cart updated");
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error("Failed to update cart");
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

      refetch();
      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      toast.success("Item removed from cart");
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error("Failed to remove item");
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.quantity * (item.products?.product_price || 0));
  }, 0);

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) {
      toast.error("No items to checkout");
      return;
    }

    try {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'completed'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create purchase items
      const purchaseItems = cartItems.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.products?.product_price || 0
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems);

      if (itemsError) throw itemsError;

      // Create notifications for each product to be rated
      for (const item of cartItems) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            purchase_id: purchase.id,
            type: 'review_request',
            message: `Please rate and review your purchase: ${item.products?.product_name}`
          });

        if (notificationError) throw notificationError;
      }

      // Clear cart items
      const { error: cartError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .in('product_id', cartItems.map(item => item.product_id));

      if (cartError) throw cartError;

      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      toast.success("Order processed successfully! Please check your notifications to rate your purchases.");
      navigate('/products');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to process order. Please try again.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground mb-4">No items selected for checkout</p>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <ScrollArea className="h-[70vh] pr-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.product_id}
                    className="flex items-center gap-4 p-4 border rounded-lg mb-4"
                  >
                    <img
                      src={item.products?.image || "/placeholder.svg"}
                      alt={item.products?.product_name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.products?.product_name}</h3>
                      <p className="text-muted-foreground">
                        ₱{item.products?.product_price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            
            <div className="md:col-span-1">
              <div className="border rounded-lg p-4 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Calculated at next step</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold mb-4">
                    <span>Total</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
