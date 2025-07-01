
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const location = useLocation();
  const queryClient = useQueryClient();
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

  // Use query client to reset cached data
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['user-reviews', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-purchases', user?.id] });
    }
  }, [queryClient, user]);

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
          .eq('status', 'completed')
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
    staleTime: 0,
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
    staleTime: 0,
  });

  // Get all reviewed product IDs
  const reviewedProductIds = userReviews.map(review => review.product_id);

  // Create a unique list of products that need reviews
  const pendingProductMap = new Map();
  
  purchases.forEach(purchase => {
    if (!purchase.purchase_items) return;
    
    purchase.purchase_items.forEach(item => {
      if (reviewedProductIds.includes(item.product_id)) {
        return;
      }
      
      if (!pendingProductMap.has(item.product_id)) {
        pendingProductMap.set(item.product_id, {
          ...item,
          purchaseId: purchase.id,
          transactionDetails: purchase.transaction_details
        });
      }
    });
  });
  
  const pendingReviews = Array.from(pendingProductMap.values());

  const handleRateNow = (productItem) => {
    navigate(`/products`, { 
      state: { 
        openReview: true,
        reviewProduct: {
          id: productItem.product_id,
          name: productItem.products?.product_name,
          image: productItem.products?.image,
          purchaseId: productItem.purchaseId,
          purchaseItemId: productItem.id
        }
      } 
    });
  };

  // Check if we should show a specific product for rating
  useEffect(() => {
    if (location.state?.showRatingFor) {
      const productId = location.state.showRatingFor;
      const productToRate = pendingReviews.find(item => item.product_id === productId);
      
      if (productToRate) {
        // Add a small delay to ensure the page is fully loaded
        setTimeout(() => {
          handleRateNow(productToRate);
        }, 500);
      }
      
      // Clear the state to prevent repeated redirects
      window.history.replaceState({}, document.title);
    }
  }, [location.state, pendingReviews]);

  if (!user) {
    return null;
  }

  const isLoading = reviewsLoading || purchasesLoading;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 flex-grow animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-purple-800">My Product Ratings</h1>
          {pendingReviews.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg">
              <span className="font-medium">🌟 You can rate {pendingReviews.length} product{pendingReviews.length > 1 ? 's' : ''}!</span>
            </div>
          )}
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
              Pending Reviews ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
              Completed Reviews ({userReviews.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4 transition-all duration-300 animate-scale-in">
            {isLoading ? (
              <Card className="border-purple-100 shadow-md">
                <CardContent className="pt-6 text-center py-8">
                  <LoadingSpinner size="lg" />
                </CardContent>
              </Card>
            ) : pendingReviews.length === 0 ? (
              <Card className="border-purple-100 shadow-md bg-white">
                <CardContent className="pt-6 text-center py-10">
                  <p className="text-muted-foreground">No pending reviews. Great job!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReviews.map((productItem) => (
                  <Card key={`pending-${productItem.product_id}-${productItem.id}`} className="overflow-hidden border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                    <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
                      <div className="flex items-center gap-3">
                        <img 
                          src={productItem.products?.image || "/placeholder.svg"} 
                          alt={productItem.products?.product_name}
                          className="w-16 h-16 object-cover rounded-md border-2 border-purple-200 shadow-sm"
                        />
                        <div>
                          <CardTitle className="text-lg text-purple-900">{productItem.products?.product_name}</CardTitle>
                          <CardDescription>Ready to review</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 transition-all" 
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
          
          <TabsContent value="completed" className="space-y-4 transition-all duration-300 animate-scale-in">
            {isLoading ? (
              <Card className="border-purple-100 shadow-md">
                <CardContent className="pt-6 text-center py-8">
                  <LoadingSpinner size="lg" />
                </CardContent>
              </Card>
            ) : userReviews.length === 0 ? (
              <Card className="border-purple-100 shadow-md bg-white">
                <CardContent className="pt-6 text-center py-10">
                  <p className="text-muted-foreground">You haven't submitted any reviews yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userReviews.map((review) => (
                  <Card key={review.id} className="overflow-hidden border-purple-100 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
                      <div className="flex items-center gap-3">
                        <img 
                          src={review.products?.image || "/placeholder.svg"} 
                          alt={review.products?.product_name}
                          className="w-16 h-16 object-cover rounded-md border-2 border-purple-200 shadow-sm"
                        />
                        <div>
                          <CardTitle className="text-lg text-purple-900">{review.products?.product_name}</CardTitle>
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
