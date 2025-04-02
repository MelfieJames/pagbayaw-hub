
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { CartItem } from "@/types/product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  MinusCircle, PlusCircle, Trash2, CreditCard, 
  User, MapPin, Phone, Check, ShoppingBag,
  ArrowRight, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile } from "@/hooks/useProfile";

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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showOrderSummaryDialog, setShowOrderSummaryDialog] = useState(false);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);

  // Use the profile hook with redirect if incomplete
  const { profileData, isLoading: isLoadingProfile, isComplete } = 
    useProfile(true, "/profile");

  const { data: cartItems = [], refetch } = useQuery({
    queryKey: ['checkout-items', selectedItems],
    queryFn: async () => {
      if (!user?.id) return [];
      
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
      if (selectedItems.length > 0 && !location.state?.fromCart) {
        const updatedItems = cartItems.map(item => {
          if (item.product_id === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        
        queryClient.setQueryData(['checkout-items', selectedItems], updatedItems);
        return;
      }

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

    // If profile is not complete, redirect to profile page
    if (!isComplete) {
      navigate('/profile', { 
        state: { redirectAfterUpdate: '/checkout' }
      });
      return;
    }
    
    setIsProcessing(true);

    try {
      console.log("Starting checkout process with items:", cartItems);
      
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
      
      console.log("Created purchase:", purchase);
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
      
      console.log("Created purchase items:", purchaseItems);

      // Update inventory
      for (const item of cartItems) {
        const inventoryItem = inventoryData.find(inv => inv.product_id === item.product_id);
        
        if (inventoryItem) {
          const newQuantity = inventoryItem.quantity - item.quantity;
          console.log(`Updating inventory for product ${item.product_id} from ${inventoryItem.quantity} to ${newQuantity}`);
          
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
      
      // Clear cart
      const { error: cartError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .in('product_id', cartItems.map(item => item.product_id));

      if (cartError) {
        console.error("Cart clearing error:", cartError);
        throw cartError;
      }

      // Invalidate relevant queries
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

  const handleOrderSummaryClose = () => {
    setShowOrderSummaryDialog(false);
    setShowSuccessDialog(true);
  };

  if (!user) {
    navigate('/login', {
      state: { redirectAfterLogin: '/checkout', message: "Please log in to access checkout" }
    });
    return null;
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 flex justify-center items-center h-[50vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
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
              <div className="bg-white p-5 rounded-lg shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                  <User className="h-5 w-5 text-primary" /> Shipping Information
                </h2>
                
                {isComplete && profileData ? (
                  <div className="space-y-3 pl-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Name</div>
                        <div className="font-medium">
                          {profileData.first_name} {profileData.middle_name && `${profileData.middle_name} `}{profileData.last_name}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Phone</div>
                        <div className="font-medium">{profileData.phone_number}</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">Address</div>
                      <div className="font-medium">{profileData.location}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-3">Please complete your profile to continue with checkout</p>
                    <Button 
                      onClick={() => navigate('/profile', { state: { redirectAfterUpdate: '/checkout' }})}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Complete Profile
                    </Button>
                  </div>
                )}
              </div>
            
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-800">
                <ShoppingBag className="h-5 w-5 text-primary" /> Order Items
              </h2>
              
              <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.product_id}
                    className="flex items-center gap-4 p-4 border rounded-lg mb-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.products?.image || "/placeholder.svg"}
                      alt={item.products?.product_name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.products?.product_name}</h3>
                      <p className="text-primary font-semibold mt-1">
                        ₱{item.products?.product_price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const inventoryItem = inventoryData.find(inv => inv.product_id === item.product_id);
                            const maxQuantity = inventoryItem?.quantity || 0;
                            if (item.quantity < maxQuantity) {
                              updateQuantity(item.product_id, item.quantity + 1);
                            } else {
                              toast.error("Cannot exceed available stock");
                            }
                          }}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-gray-500 hover:text-red-500"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        ₱{(item.products?.product_price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {inventoryData.find(inv => inv.product_id === item.product_id)?.quantity || 0} in stock
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            
            <div className="md:col-span-1">
              <div className="border rounded-lg p-6 sticky top-24 bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="pt-2">
                  <div className="flex justify-between font-semibold mb-6 text-lg">
                    <span>Total</span>
                    <span className="text-primary">₱{total.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                    disabled={!isComplete || cartItems.length === 0 || isProcessing}
                    onClick={handleCheckout}
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" /> Processing...
                      </>
                    ) : (
                      <>
                        Complete Order <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  {!isComplete && (
                    <p className="text-amber-600 text-xs mt-2 text-center">
                      Please complete your profile before checkout
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-6 w-6" />
              Order Successful!
            </DialogTitle>
            <DialogDescription>
              Your order has been successfully processed. Please check your notifications to rate your purchases.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/purchases');
              }}
            >
              View My Orders
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/products');
              }}
            >
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Summary Dialog - Shown after successful checkout */}
      <Dialog open={showOrderSummaryDialog} onOpenChange={handleOrderSummaryClose}>
        <DialogContent className="max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-green-600">
              <Check className="h-6 w-6" />
              Order Completed!
            </DialogTitle>
            <DialogDescription>
              Your order has been successfully processed and will be shipped soon.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Order Number:</span>
              <span className="font-bold">#{purchaseId}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Completed</span>
            </div>
          </div>

          {profileData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <h3 className="font-medium mb-2">Shipping Information</h3>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{profileData.first_name} {profileData.last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{profileData.phone_number}</span>
                </div>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h3 className="font-medium flex items-center gap-1">
                <ShoppingBag className="h-4 w-4 text-gray-500" />
                Order Items
              </h3>
            </div>
            <div className="p-3">
              {cartItems.map((item) => (
                <div 
                  key={item.product_id}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                >
                  <img
                    src={item.products?.image || "/placeholder.svg"}
                    alt={item.products?.product_name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.products?.product_name}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-medium text-sm">₱{(item.products?.product_price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={handleOrderSummaryClose}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
