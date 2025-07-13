
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import Footer from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-yellow-600" />,
  processing: <Package className="h-4 w-4 text-orange-600" />,
  delivering: <Truck className="h-4 w-4 text-blue-600" />,
  completed: <CheckCircle className="h-4 w-4 text-green-600" />,
  cancelled: <XCircle className="h-4 w-4 text-red-600" />,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-orange-100 text-orange-800 border-orange-200",
  delivering: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const CANCELLATION_REASONS = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Shipping is too slow",
  "Other"
];

export default function PurchaseHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          redirectAfterLogin: '/purchase-history',
          message: "Please log in to view your purchase history"
        }
      });
    }
  }, [user, navigate]);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['user-purchases-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            purchase_items(
              *,
              products(
                id,
                product_name,
                image,
                product_price
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Purchases fetch error:', error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching purchases:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Fetch user reviews to check which items have been reviewed
  const { data: userReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["my-reviews", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*, purchase_item_id")
          .eq("user_id", user.id);
        if (error) return [];
        return data || [];
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Get all reviewed purchase item IDs
  const reviewedPurchaseItemIds = userReviews.map((review) => review.purchase_item_id);

  const handleRateProduct = (productId: number) => {
    navigate('/my-ratings', { 
      state: { showRatingFor: productId }
    });
  };

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonChoice, setCancelReasonChoice] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  const filteredPurchases = statusFilter === "all"
    ? purchases
    : purchases.filter((p) => p.status === statusFilter);

  const handleCancelOrder = (orderId: number) => {
    setCancellingOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    let reason = cancelReasonChoice === "Other" ? cancelReason.trim() : cancelReasonChoice;
    if (!cancellingOrderId || !reason) return;
    await supabase
      .from('purchases')
      .update({ status: 'cancelled', cancellation_reason: reason })
      .eq('id', cancellingOrderId);
    setShowCancelModal(false);
    setCancelReason("");
    setCancelReasonChoice("");
    setCancellingOrderId(null);
    setShowThankYouModal(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F8FFFB] via-[#E9F8F3] to-[#DFF5EC]">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 flex-grow animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-[#0E4A22]">Purchase History</h1>
        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'processing', 'delivering', 'completed', 'cancelled'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              className={statusFilter === status ? 'bg-[#0E4A22] text-white' : 'border-[#A7E9C5] text-[#0E4A22] hover:bg-[#A7E9C5] hover:text-white'}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        
        {isLoading ? (
          <Card className="border-green-100 shadow-md">
            <CardContent className="pt-6 text-center py-8">
              <LoadingSpinner size="lg" />
            </CardContent>
          </Card>
        ) : filteredPurchases.length === 0 ? (
          <Card className="border-green-100 shadow-md bg-white">
            <CardContent className="pt-6 text-center py-10">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No purchases found.</p>
              <Button 
                className="mt-4 bg-[#0E4A22] hover:bg-[#388E5C] text-white"
                onClick={() => navigate('/products')}
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.id} className="border-green-100 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-[#A7E9C5] to-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[#0E4A22]">Order #{purchase.id}</CardTitle>
                      <CardDescription className="text-green-700">
                        Placed on {new Date(purchase.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${STATUS_COLORS[purchase.status]} border`}>
                        {STATUS_ICONS[purchase.status]}
                        <span className="ml-1 capitalize">{purchase.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {purchase.purchase_items?.map((item) => {
                      const alreadyReviewed = reviewedPurchaseItemIds.includes(item.id);
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.products?.image || "/placeholder.svg"}
                            alt={item.products?.product_name}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.products?.product_name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-sm font-medium text-green-600">
                              ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          {purchase.status === 'completed' && !alreadyReviewed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#A7E9C5] text-[#0E4A22] hover:bg-[#A7E9C5] hover:text-white"
                              onClick={() => navigate('/products', {
                                state: {
                                  openReview: true,
                                  reviewProduct: {
                                    id: item.product_id,
                                    name: item.products?.product_name,
                                    image: item.products?.image,
                                    purchaseId: purchase.id,
                                    purchaseItemId: item.id
                                  }
                                }
                              })}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Rate
                            </Button>
                          )}
                          {purchase.status === 'completed' && alreadyReviewed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 text-gray-400 cursor-not-allowed"
                              disabled
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Rated
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-semibold text-gray-900">
                      Total: ₱{Number(purchase.total_amount).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      {purchase.status === 'pending' && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelOrder(purchase.id)}
                        >
                          Cancel Order
                        </Button>
                      )}
                      {purchase.status === 'completed' && (
                        <Button
                          variant="outline"
                          className="border-[#A7E9C5] text-[#0E4A22] hover:bg-[#A7E9C5] hover:text-white"
                          onClick={() => navigate('/my-ratings')}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          View My Ratings
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Cancel Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Cancel Order</DialogTitle>
            </DialogHeader>
            <div className="mb-6">
              <label className="block mb-3 font-medium text-gray-700">Select a reason for cancellation:</label>
              <div className="space-y-2">
                {CANCELLATION_REASONS.map((reason) => (
                  <div key={reason} className="flex items-center">
                    <input
                      type="radio"
                      id={`reason-${reason}`}
                      name="cancelReason"
                      value={reason}
                      checked={cancelReasonChoice === reason}
                      onChange={(e) => setCancelReasonChoice(e.target.value)}
                      className="mr-3 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <label htmlFor={`reason-${reason}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                      {reason}
                    </label>
                  </div>
                ))}
              </div>
              {cancelReasonChoice === "Other" && (
                <div className="mt-4">
                  <label htmlFor="cancel-reason" className="block mb-2 text-sm font-medium text-gray-700">
                    Please specify your reason:
                  </label>
                  <Input
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Enter your reason..."
                    className="w-full"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>Close</Button>
              <Button 
                variant="destructive" 
                onClick={confirmCancelOrder} 
                disabled={!cancelReasonChoice || (cancelReasonChoice === "Other" && !cancelReason.trim())}
              >
                Confirm Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Thank You Modal */}
        <Dialog open={showThankYouModal} onOpenChange={setShowThankYouModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-xl text-center">Thank You!</DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <p className="text-gray-700 mb-4">Thank you for your feedback. Your order has been cancelled successfully.</p>
            </div>
            <DialogFooter>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => {
                  setShowThankYouModal(false);
                  window.location.reload();
                }}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
