
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function MyRatings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          redirectAfterLogin: '/my-ratings',
          message: "Please log in to view your ratings"
        }
      });
    }
  }, [user, navigate]);

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log("Fetching notifications for user:", user.id);
      
      try {
        // First get notifications
        const { data: notificationData, error: notificationError } = await supabase
          .from('notifications')
          .select('*, purchases(*)')
          .eq('user_id', user.id)
          .eq('type', 'review_request')
          .order('created_at', { ascending: false });

        if (notificationError) {
          console.error('Notifications fetch error:', notificationError);
          return [];
        }
        
        if (!notificationData?.length) {
          console.log("No notifications found");
          return [];
        }
        
        console.log("Fetched notifications:", notificationData);
        
        // For each notification, get associated purchase items and product details
        const notificationsWithProducts = await Promise.all(
          notificationData.map(async (notification) => {
            // Get purchase items for this purchase
            const { data: purchaseItems, error: purchaseItemsError } = await supabase
              .from('purchase_items')
              .select('*, products(*)')
              .eq('purchase_id', notification.purchase_id);
              
            if (purchaseItemsError) {
              console.error('Purchase items fetch error:', purchaseItemsError);
              return notification;
            }
            
            // Attach the products data to the notification
            return {
              ...notification,
              products: purchaseItems
            };
          })
        );
        
        console.log("Notifications with products:", notificationsWithProducts);
        return notificationsWithProducts;
      } catch (error) {
        console.error('Unexpected error fetching notifications:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Fetch all purchases with their transaction details
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            transaction_details(*),
            purchase_items(*, products(*))
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

  const { data: userReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log("Fetching reviews for user:", user.id);
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            products (
              id,
              product_name,
              image,
              product_price
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Reviews fetch error:', error);
          return [];
        }
        
        console.log("Fetched user reviews:", data);
        return data || [];
      } catch (error) {
        console.error('Unexpected error fetching reviews:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Create a unique list of all purchased products that need reviews
  const allPurchasedProducts = purchases.flatMap(purchase => 
    purchase.purchase_items?.map(item => ({
      ...item,
      purchaseId: purchase.id,
      transactionDetails: purchase.transaction_details
    })) || []
  );
  
  // Create a unique list of products that need reviews
  // Group by product ID to avoid duplicates and filter out already reviewed products
  const pendingProductMap = new Map();
  
  allPurchasedProducts.forEach(item => {
    // Skip products that have already been reviewed
    if (userReviews.some(review => review.product_id === item.product_id)) {
      return;
    }
    
    // Only add if not already in the map
    if (!pendingProductMap.has(item.product_id)) {
      pendingProductMap.set(item.product_id, item);
    }
  });
  
  // Convert map to array
  const pendingReviews = Array.from(pendingProductMap.values());

  const handleRateNow = (productItem) => {
    navigate(`/products`, { 
      state: { 
        openReview: true,
        reviewProduct: {
          id: productItem.product_id,
          name: productItem.products?.product_name,
          image: productItem.products?.image,
          purchaseId: productItem.purchase_id
        }
      } 
    });
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const isLoading = notificationsLoading || reviewsLoading || purchasesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 flex-grow">
        <h1 className="text-3xl font-bold mb-6">My Product Ratings</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending">Pending Reviews ({pendingReviews.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed Reviews ({userReviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center py-8">
                  <LoadingSpinner size="lg" />
                </CardContent>
              </Card>
            ) : pendingReviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No pending reviews. Great job!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReviews.map((productItem) => (
                  <Card key={`pending-${productItem.product_id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={productItem.products?.image || "/placeholder.svg"} 
                          alt={productItem.products?.product_name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <CardTitle className="text-lg">{productItem.products?.product_name}</CardTitle>
                          <CardDescription>Ready to review</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full mt-2" 
                        onClick={() => handleRateNow(productItem)}
                      >
                        Rate Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center py-8">
                  <LoadingSpinner size="lg" />
                </CardContent>
              </Card>
            ) : userReviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">You haven't submitted any reviews yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={review.products?.image || "/placeholder.svg"} 
                          alt={review.products?.product_name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <CardTitle className="text-lg">{review.products?.product_name}</CardTitle>
                          <CardDescription>Reviewed on {new Date(review.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex mt-2 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="w-5 h-5" 
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm">{review.comment || "No comment provided."}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
