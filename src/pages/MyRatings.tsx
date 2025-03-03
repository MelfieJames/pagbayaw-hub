
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

export default function MyRatings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");

  // Redirect if not logged in
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

  // Get all review requests from notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          purchases (
            id,
            total_amount,
            status
          ),
          products: purchase_items!inner(
            product_id,
            products(
              product_name,
              image
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('type', 'review_request')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Notifications fetch error:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get all reviews the user has submitted
  const { data: userReviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
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
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Filter pending review products by checking if they've been reviewed
  const pendingReviews = notifications.filter(notification => {
    const productId = notification.products?.[0]?.product_id;
    return !userReviews.some(review => 
      review.product_id === productId && 
      review.purchase_item_id === notification.purchase_id
    );
  });

  const handleRateNow = (notification: any) => {
    const productId = notification.products?.[0]?.product_id;
    const productName = notification.products?.[0]?.products?.product_name;
    const productImage = notification.products?.[0]?.products?.image;
    
    navigate(`/products`, { 
      state: { 
        openReview: true,
        reviewProduct: {
          id: productId,
          name: productName,
          image: productImage,
          purchaseId: notification.purchase_id
        }
      } 
    });
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-3xl font-bold mb-6">My Product Ratings</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending">Pending Reviews ({pendingReviews.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed Reviews ({userReviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {pendingReviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No pending reviews. Great job!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReviews.map((notification) => {
                  const productDetails = notification.products?.[0]?.products;
                  return (
                    <Card key={notification.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={productDetails?.image || "/placeholder.svg"} 
                            alt={productDetails?.product_name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div>
                            <CardTitle className="text-lg">{productDetails?.product_name}</CardTitle>
                            <CardDescription>Purchased on {new Date(notification.created_at).toLocaleDateString()}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full mt-2" 
                          onClick={() => handleRateNow(notification)}
                        >
                          Rate Now
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {userReviews.length === 0 ? (
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
                ));
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
