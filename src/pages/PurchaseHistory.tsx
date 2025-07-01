
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

  const handleRateProduct = (productId: number) => {
    navigate('/my-ratings', { 
      state: { showRatingFor: productId }
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 flex-grow animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Purchase History</h1>
        
        {isLoading ? (
          <Card className="border-blue-100 shadow-md">
            <CardContent className="pt-6 text-center py-8">
              <LoadingSpinner size="lg" />
            </CardContent>
          </Card>
        ) : purchases.length === 0 ? (
          <Card className="border-blue-100 shadow-md bg-white">
            <CardContent className="pt-6 text-center py-10">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No purchases found.</p>
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/products')}
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="border-blue-100 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-blue-900">Order #{purchase.id}</CardTitle>
                      <CardDescription>
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
                    {purchase.purchase_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={item.products?.image || "/placeholder.svg"} 
                          alt={item.products?.product_name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.products?.product_name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium text-blue-600">
                            ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        {purchase.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                            onClick={() => handleRateProduct(item.product_id)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-semibold text-gray-900">
                      Total: ₱{Number(purchase.total_amount).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      {purchase.status === 'completed' && (
                        <Button
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
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
      </div>
      <Footer />
    </div>
  );
}
