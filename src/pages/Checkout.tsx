import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { CartItem } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

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
  const selectedItems = location.state?.selectedItems || [];

  const { data: cartItems = [], refetch: refetchCart } = useQuery<CartItem[], Error>({
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
        .in('product_id', selectedItems)
        .returns<SupabaseCartResponse[]>();

      if (error) {
        console.error('Cart fetch error:', error);
        return [];
      }
      
      return responseData.map(item => ({
        quantity: item.quantity,
        product_id: item.product_id,
        products: item.products
      }));
    },
    enabled: !!user?.id && selectedItems.length > 0,
    initialData: []
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

      refetchCart();
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

      refetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error("Failed to remove item");
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.quantity * (item.products?.product_price || 0));
  }, 0);

  const handleCheckout = () => {
    // TODO: Implement payment processing
    toast.info("Checkout functionality coming soon!");
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.product_id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
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
