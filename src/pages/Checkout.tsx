import { useState, useEffect, useRef } from "react";
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
import AddressManagement from "@/components/checkout/AddressManagement";
import PaymentInfo from "@/components/checkout/PaymentInfo";
import CancellationModal from "@/components/checkout/CancellationModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

// Utility: persist and load checkout-items from localStorage
function persistCheckoutItems(items: CartItem[]) {
  localStorage.setItem('checkout-items', JSON.stringify(items));
}
function loadCheckoutItems(): CartItem[] {
  try {
    const data = localStorage.getItem('checkout-items');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showOrderSummaryDialog, setShowOrderSummaryDialog] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // Track if we loaded from cache/localStorage
  const loadedFromCache = useRef(false);

  const cachedBuyNowItems = queryClient.getQueryData<CartItem[]>(['checkout-items']) || [];

  // On mount, load checkout-items from localStorage if cache is empty
  useEffect(() => {
    if (!queryClient.getQueryData(['checkout-items'])) {
      const localItems = loadCheckoutItems();
      if (localItems.length > 0) {
        queryClient.setQueryData(['checkout-items'], localItems);
        loadedFromCache.current = true;
      }
    } else if (cachedBuyNowItems.length > 0) {
      loadedFromCache.current = true;
    }
  }, [queryClient]);

  // Whenever checkout-items changes, persist to localStorage
  useEffect(() => {
    if (cachedBuyNowItems && cachedBuyNowItems.length > 0) {
      persistCheckoutItems(cachedBuyNowItems);
    }
  }, [cachedBuyNowItems]);

  // Only enable the query if we did NOT load from cache/localStorage
  const { data: cartItems = [], refetch } = useQuery({
    queryKey: ['checkout-items'],
    queryFn: async () => {
      // If we have Buy Now items in the cache, return those instead of fetching from cart
      if (cachedBuyNowItems && cachedBuyNowItems.length > 0) {
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
    enabled: !loadedFromCache.current && !!user?.id,
  });

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

  // Get user's addresses
  const { data: userAddresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Set default address as selected if available
  useEffect(() => {
    if (userAddresses.length > 0) {
      const defaultAddress = userAddresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else {
        setSelectedAddress(userAddresses[0]);
      }
    }
  }, [userAddresses]);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (!user?.id || newQuantity < 1) return;

    const inventoryItem = inventoryData.find(item => item.product_id === productId);
    const maxQuantity = inventoryItem?.quantity || 0;

    if (newQuantity > maxQuantity) {
      toast.error("Cannot exceed available stock");
      return;
    }

    try {
      // For cached buy now items, update locally
      if (cachedBuyNowItems.length > 0) {
        const updatedItems = cachedBuyNowItems.map(item => 
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        );
        queryClient.setQueryData(['checkout-items'], updatedItems);
        persistCheckoutItems(updatedItems); // Persist updated items
        return;
      }

      // For regular cart items, update in database
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

    // For cached buy now items, remove locally
    if (cachedBuyNowItems.length > 0) {
      const updatedItems = cachedBuyNowItems.filter(item => item.product_id !== productId);
      queryClient.setQueryData(['checkout-items'], updatedItems);
      persistCheckoutItems(updatedItems); // Persist updated items
      return;
    }

    // For regular cart items, remove from database
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

  // Instead of processing order immediately, show summary dialog for confirmation
  const handleCheckout = () => {
    setShowOrderSummaryDialog(true);
  };

  // New function to actually process the order after confirmation
  const processOrder = async () => {
    setIsProcessing(true);
    try {
      if (!user || cartItems.length === 0) {
        toast.error("No items to checkout");
        return;
      }
      if (!selectedAddress) {
        toast.error("Please add a delivery address before placing your order.");
        return;
      }

      // Check inventory before proceeding
      let hasInventoryError = false;
      for (const item of cartItems) {
        const inventoryItem = inventoryData.find(inv => inv.product_id === item.product_id);
        
        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          toast.error(`Not enough stock for ${item.products?.product_name}`);
          hasInventoryError = true;
        }
      }

      if (hasInventoryError) {
        setIsProcessing(false);
        return;
      }

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          email: user.email,
          user_address_id: selectedAddress ? selectedAddress.id : null
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

      // If we have a selected address, link it to the purchase
      if (selectedAddress) {
        // Format the address
        const addressLine2 = selectedAddress.address_line2 ? `${selectedAddress.address_line2}, ` : '';
        const fullAddress = `${selectedAddress.address_line1}, ${addressLine2}${selectedAddress.city}, ${selectedAddress.state_province}, ${selectedAddress.postal_code}, ${selectedAddress.country}`;
        
        const { error: transactionError } = await supabase
          .from('transaction_details')
          .insert({
            purchase_id: purchase.id,
            first_name: selectedAddress.recipient_name.split(' ')[0],
            last_name: selectedAddress.recipient_name.split(' ').slice(1).join(' '),
            email: user.email,
            phone_number: selectedAddress.phone_number,
            address: fullAddress
          });
          
        if (transactionError) {
          console.error("Transaction details error:", transactionError);
        }
      } else {
        // Even if no address is selected, create a minimal transaction record
        const { error: transactionError } = await supabase
          .from('transaction_details')
          .insert({
            purchase_id: purchase.id,
            first_name: user.name || user.email?.split('@')[0] || 'Customer',
            last_name: '',
            email: user.email,
            phone_number: '',
            address: 'Not provided'
          });
          
        if (transactionError) {
          console.error("Transaction details error:", transactionError);
        }
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
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            purchase_id: purchase.id,
            type: 'order',
            message: `Your order #${purchase.id} has been received and is pending approval.`
          });

        if (notificationError) {
          console.error('Notification creation error:', notificationError);
        }
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }
      
      // Always clear the cart for the current user after successful order
      const { error: cartError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
      if (cartError) {
        console.error("Cart clearing error:", cartError);
        throw cartError;
      }
      queryClient.removeQueries({ queryKey: ['checkout-items'] });
      localStorage.removeItem('checkout-items');
      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-data'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sales-data'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sales-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-purchases', user.id] });
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      
      // Show the success dialog
      setShowSuccessDialog(true);
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

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
  };

  const handleCancellation = async (reason: string, details?: string) => {
    // For now, just navigate back to products with a cancellation message
    toast.success("Order cancelled successfully");
    navigate('/products');
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
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 hover:bg-gray-100"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Button>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">              
              <OrderItems 
                cartItems={cartItems} 
                inventoryData={inventoryData}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
              
              <Card className="bg-white border rounded-xl shadow-sm">
                <CardHeader className="p-4 border-b bg-gray-50">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    Shipping Address
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Optional
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <AddressManagement 
                    onAddressSelect={handleAddressSelect}
                    selectedAddress={selectedAddress}
                    showSelectionUI={true}
                  />
                </CardContent>
              </Card>

              <PaymentInfo />
            </div>
            
            <div className="md:col-span-1">
              <OrderSummary 
                total={total}
                isComplete={true}
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
        onDetailsSubmitted={processOrder}
        readOnly={true}
        selectedAddress={selectedAddress}
      />
    </div>
  );
}
