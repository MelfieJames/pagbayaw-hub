import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { CartItem } from "@/types/product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import OrderItems from "@/components/checkout/OrderItems";
import OrderSummary from "@/components/checkout/OrderSummary";
import OrderSuccessDialog from "@/components/checkout/OrderSuccessDialog";
import OrderSummaryDialog from "@/components/checkout/OrderSummaryDialog";

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
  const queryClient = useQueryClient();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showOrderSummaryDialog, setShowOrderSummaryDialog] = useState(false);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);

  // Get cached Buy Now items if they exist
  const cachedBuyNowItems = queryClient.getQueryData<CartItem[]>(['checkout-items']) || [];

  const { data: cartItems = [], refetch } = useQuery({
    queryKey: ['checkout-items'],
    queryFn: async () => {
      // If we have Buy Now items in the cache, return those instead of fetching from cart
      if (cachedBuyNowItems && cachedBuyNowItems.length > 0) {
        console.log("Using Buy Now items:", cachedBuyNowItems);
        return cachedBuyNowItems;
      }
      
      if (!user?.id) return [];
      
      // Otherwise fetch normal cart items
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
      
      return responseData as CartItem[];
    },
    enabled: !!user?.id || cachedBuyNowItems.length > 0,
  });

  // Clear the Buy Now items from cache when leaving the checkout page
  useEffect(() => {
    return () => {
      if (cachedBuyNowItems.length > 0) {
        queryClient.removeQueries({ queryKey: ['checkout-items'] });
      }
    };
  }, [cachedBuyNowItems.length, queryClient]);

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

  // Calculate total only once
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.quantity * (item.products?.product_price || 0));
  }, 0);

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) {
      toast.error("No items to checkout");
      return;
    }
    
    setIsProcessing(true);

    try {
      for (const item of cartItems) {
        const inventoryItem = inventoryData.find(inv => inv.product_id === item.product_id);
        
        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          toast.error(`Not enough stock for ${item.products?.product_name}`);
          setIsProcessing(false);
          return;
        }
      }

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'completed'
        })
        .select()
        .single();

      if (purchaseError) {
        console.error("Purchase creation error:", purchaseError);
        throw purchaseError;
      }
      
      setPurchaseId(purchase.id);

      const purchaseItems = cartItems.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.products?.product_price || 0
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems);

      if (itemsError) {
        console.error("Purchase items error:", itemsError);
        throw itemsError;
      }

      // Update inventory
      for (const item of cartItems) {
        const inventoryItem = inventoryData.find(inv => inv.product_id === item.product_id);
        
        if (inventoryItem) {
          const newQuantity = inventoryItem.quantity - item.quantity;
          
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ 
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('product_id', item.product_id);

          if (updateError) {
            console.error(`Inventory update error for product ${item.product_id}:`, updateError);
            throw updateError;
          }
        }
      }

      // Create notifications
      for (const item of cartItems) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            purchase_id: purchase.id,
            type: 'review_request',
            message: `Please rate and review your purchase: ${item.products?.product_name}`
          });

        if (notificationError) {
          console.error('Notification creation error:', notificationError);
          throw notificationError;
        }
      }
      
      // Clear cart only if this was a cart purchase (not Buy Now)
      if (cachedBuyNowItems.length === 0) {
        const { error: cartError } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id)
          .in('product_id', cartItems.map(item => item.product_id));

        if (cartError) {
          console.error("Cart clearing error:", cartError);
          throw cartError;
        }
      }

      // Invalidate and remove relevant queries
      queryClient.removeQueries({ queryKey: ['checkout-items'] });
      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-data'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sales-data'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sales-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-purchases', user.id] });
      
      // Show order summary dialog
      setShowOrderSummaryDialog(true);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDetailsSubmitted = () => {
    setShowOrderSummaryDialog(false);
    setShowSuccessDialog(true);
  };

  if (!user) {
    navigate('/login', {
      state: { redirectAfterLogin: '/checkout', message: "Please log in to access checkout" }
    });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2 hover:bg-gray-100"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Button>

        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8 border rounded-lg shadow-sm bg-white">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-primary/90"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <OrderItems 
                cartItems={cartItems} 
                inventoryData={inventoryData}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            </div>
            
            <div className="md:col-span-1">
              <OrderSummary 
                total={total}
                isComplete={true} // No longer requiring complete profile
                cartItems={cartItems}
                isProcessing={isProcessing}
                handleCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <OrderSuccessDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        navigateToOrders={() => {
          setShowSuccessDialog(false);
          navigate('/purchases');
        }}
        navigateToProducts={() => {
          setShowSuccessDialog(false);
          navigate('/products');
        }}
      />

      {/* Order Summary Dialog - Shown after successful checkout */}
      <OrderSummaryDialog
        open={showOrderSummaryDialog}
        onOpenChange={setShowOrderSummaryDialog}
        purchaseId={purchaseId}
        userEmail={user?.email}
        cartItems={cartItems}
        total={total}
        onDetailsSubmitted={handleDetailsSubmitted}
      />
    </div>
  );
}
