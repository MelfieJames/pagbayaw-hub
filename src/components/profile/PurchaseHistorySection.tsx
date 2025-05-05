
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, Star, Clock, CheckCircle, AlertTriangle, X, Truck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReviewSection from "@/components/products/ReviewSection";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function PurchaseHistorySection() {
  const { user } = useAuth();
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProductToReview, setSelectedProductToReview] = useState(null);
  const [selectedPurchaseItem, setSelectedPurchaseItem] = useState(null);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["user-purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          purchase_items(
            id,
            product_id,
            quantity,
            price_at_time,
            reviews(id, rating, comment),
            products(product_name, image)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // If there's a purchase ID in the URL query, open its details
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseIdToHighlight = urlParams.get('highlight');
    
    if (purchaseIdToHighlight) {
      const purchase = purchases.find(p => p.id.toString() === purchaseIdToHighlight);
      if (purchase) {
        setSelectedPurchase(purchase);
        setIsDetailsOpen(true);
        
        // Clean up the URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [purchases]);

  const getBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "approved":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "processing":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      case "delivering":
        return "bg-[#C4A484] hover:bg-[#a68967] text-white";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "delivering":
        return <Truck className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleOpenReview = (product, purchaseItem, purchase) => {
    setSelectedProductToReview(product);
    setSelectedPurchaseItem(purchaseItem);
    setSelectedPurchase(purchase);
    setIsReviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Purchase History</h2>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Package className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">You haven't made any purchases yet</p>
            <Button onClick={() => window.location.href = "/products"}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onViewDetails={() => {
                  setSelectedPurchase(purchase);
                  setIsDetailsOpen(true);
                }}
                onReviewProduct={(product, purchaseItem) => 
                  handleOpenReview(product, purchaseItem, purchase)
                }
                getBadgeColor={getBadgeColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {purchases
              .filter((p) => ["pending", "approved"].includes(p.status?.toLowerCase()))
              .map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onViewDetails={() => {
                    setSelectedPurchase(purchase);
                    setIsDetailsOpen(true);
                  }}
                  onReviewProduct={(product, purchaseItem) => 
                    handleOpenReview(product, purchaseItem, purchase)
                  }
                  getBadgeColor={getBadgeColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            {purchases
              .filter((p) => ["processing", "delivering"].includes(p.status?.toLowerCase()))
              .map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onViewDetails={() => {
                    setSelectedPurchase(purchase);
                    setIsDetailsOpen(true);
                  }}
                  onReviewProduct={(product, purchaseItem) => 
                    handleOpenReview(product, purchaseItem, purchase)
                  }
                  getBadgeColor={getBadgeColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {purchases
              .filter((p) => p.status?.toLowerCase() === "completed")
              .map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onViewDetails={() => {
                    setSelectedPurchase(purchase);
                    setIsDetailsOpen(true);
                  }}
                  onReviewProduct={(product, purchaseItem) => 
                    handleOpenReview(product, purchaseItem, purchase)
                  }
                  getBadgeColor={getBadgeColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Purchase Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedPurchase?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedPurchase &&
                format(new Date(selectedPurchase.created_at), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedPurchase.status)}
                  <Badge className={getBadgeColor(selectedPurchase.status)}>
                    {selectedPurchase.status?.charAt(0).toUpperCase() + 
                     selectedPurchase.status?.slice(1)}
                  </Badge>
                </div>
                <div className="font-medium">
                  Total: ₱{Number(selectedPurchase.total_amount).toFixed(2)}
                </div>
              </div>

              <ScrollArea className="h-60 border rounded-md p-4">
                <div className="space-y-4">
                  {selectedPurchase.purchase_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 pb-3 border-b last:border-0"
                    >
                      <img
                        src={item.products?.image || "/placeholder.svg"}
                        alt={item.products?.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.products?.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₱{Number(item.price_at_time).toFixed(2)} x {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                      </div>
                      {selectedPurchase.status?.toLowerCase() === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleOpenReview(item.products, item, selectedPurchase)}
                        >
                          <Star className="h-3 w-3" />
                          {item.reviews?.length > 0 ? "Edit Review" : "Review"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Product</DialogTitle>
            <DialogDescription>
              Share your experience with this product
            </DialogDescription>
          </DialogHeader>

          {selectedProductToReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProductToReview.image || "/placeholder.svg"}
                  alt={selectedProductToReview.product_name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">
                    {selectedProductToReview.product_name}
                  </h3>
                </div>
              </div>

              <ReviewSection
                productId={selectedProductToReview.product_id}
                purchaseId={selectedPurchase?.id}
                purchaseItemId={selectedPurchaseItem?.id}
                onSubmitReview={() => setIsReviewOpen(false)}
                isCompleted={selectedPurchase?.status?.toLowerCase() === "completed"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PurchaseCard({ 
  purchase, 
  onViewDetails, 
  onReviewProduct,
  getBadgeColor,
  getStatusIcon 
}) {
  return (
    <Card key={purchase.id} className="overflow-hidden">
      <CardHeader className="bg-gray-50 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <CardTitle className="text-base">Order #{purchase.id}</CardTitle>
          <Badge className={getBadgeColor(purchase.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(purchase.status)}
              {purchase.status?.charAt(0).toUpperCase() + purchase.status?.slice(1)}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              {format(new Date(purchase.created_at), "MMMM d, yyyy")}
            </span>
            <span className="font-medium">
              ₱{Number(purchase.total_amount).toFixed(2)}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {purchase.purchase_items?.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <img
                    src={item.products?.image || "/placeholder.svg"}
                    alt={item.products?.product_name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.products?.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  
                  {purchase.status?.toLowerCase() === "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReviewProduct(item.products, item);
                      }}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {item.reviews?.length > 0 ? "Edit" : "Rate"}
                    </Button>
                  )}
                </div>
              ))}
              
              {purchase.purchase_items?.length > 2 && (
                <div className="text-sm text-gray-500 md:col-span-2">
                  + {purchase.purchase_items.length - 2} more items
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
