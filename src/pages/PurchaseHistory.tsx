
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import Navbar from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingBag, Package, Calendar, Search, X, AlertCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PurchaseItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  products: {
    product_name: string;
    image: string;
    id: number;
  };
}

interface Purchase {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
  purchase_items: PurchaseItem[];
}

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [currentTab, setCurrentTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading, error } = useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_items(
            *,
            products(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching purchases:", error);
        throw new Error("Error fetching purchases. Please try again later.");
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (purchaseId: number) => {
      // Step 1: Get purchase items to restore inventory
      const { data: purchaseData, error: fetchError } = await supabase
        .from('purchases')
        .select(`
          purchase_items(product_id, quantity)
        `)
        .eq('id', purchaseId)
        .single();

      if (fetchError) throw fetchError;

      // Step 2: Update purchase status to cancelled
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', purchaseId);

      if (updateError) throw updateError;

      // Step 3: Restore inventory quantities using the edge function
      const purchaseItems = purchaseData.purchase_items;
      for (const item of purchaseItems) {
        try {
          const response = await supabase.functions.invoke('increment-inventory', {
            body: { 
              productId: item.product_id, 
              quantity: item.quantity 
            }
          });
          
          if (!response.data.success) {
            console.error('Error updating inventory via function:', response.data.message);
          }
        } catch (err) {
          console.error('Error calling increment-inventory function:', err);
        }
      }

      return purchaseId;
    },
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['user-purchases', user?.id] });
    },
    onError: (error) => {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    }
  });

  const handleCancelOrder = (purchaseId: number) => {
    setSelectedPurchaseId(purchaseId);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = () => {
    if (selectedPurchaseId) {
      cancelOrderMutation.mutate(selectedPurchaseId);
    }
  };

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setDetailsDialogOpen(true);
  };

  let filteredPurchases = purchases.filter(purchase => {
    if (!searchTerm) return true;
    
    // Search by purchase ID
    if (purchase.id.toString().includes(searchTerm)) return true;
    
    // Search by product name
    return purchase.purchase_items?.some(item => 
      item.products?.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter based on tab
  if (currentTab === "pending") {
    filteredPurchases = filteredPurchases.filter(p => p.status === "pending");
  } else if (currentTab === "completed") {
    filteredPurchases = filteredPurchases.filter(p => p.status === "completed");
  } else if (currentTab === "cancelled") {
    filteredPurchases = filteredPurchases.filter(p => p.status === "cancelled");
  }

  // Calculate statistics
  const totalOrders = purchases.length;
  const completedOrders = purchases.filter(p => p.status === "completed").length;
  const pendingOrders = purchases.filter(p => p.status === "pending").length;
  const cancelledOrders = purchases.filter(p => p.status === "cancelled").length;
  
  const totalSpent = purchases
    .filter(p => p.status !== "cancelled")
    .reduce((sum, p) => sum + Number(p.total_amount), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="flex justify-center items-center h-[50vh]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Purchases</h2>
            <p className="text-red-600 mb-4">We couldn't load your purchase history. Please try again later.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" /> Purchase History
        </h1>
        
        {/* Order Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">{completedOrders}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold">₱{totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by order number or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs for filtering */}
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All Orders ({totalOrders})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingOrders})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledOrders})</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredPurchases.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-1">No purchases yet</h3>
            <p className="text-gray-500 mb-6">When you make purchases, they will appear here</p>
            <Button onClick={() => window.location.href = '/products'}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.id} className="shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50 border-b pb-3">
                  <div className="flex flex-wrap items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" /> 
                      Order #{purchase.id}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-sm text-gray-500 gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(purchase.created_at), 'PPP')}
                      </div>
                      <Badge className={
                        purchase.status === 'completed' ? 'bg-green-500' : 
                        purchase.status === 'cancelled' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }>
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    {purchase.purchase_items?.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 my-2 py-2">
                        <img 
                          src={item.products?.image || "/placeholder.svg"}
                          alt={item.products?.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.products?.product_name}</div>
                          <div className="text-sm text-gray-500">
                            ₱{Number(item.price_at_time).toFixed(2)} x {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium">
                          ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    
                    {purchase.purchase_items?.length > 2 && (
                      <p className="text-sm text-gray-500 mt-2">
                        + {purchase.purchase_items.length - 2} more items
                      </p>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="text-sm text-gray-500">Total</span>
                      <div className="font-bold">₱{Number(purchase.total_amount).toFixed(2)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewDetails(purchase)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      {purchase.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleCancelOrder(purchase.id)}
                          className="flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep order</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmCancelOrder}
                className="bg-red-500 hover:bg-red-600"
                disabled={cancelOrderMutation.isPending}
              >
                {cancelOrderMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Cancelling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" /> Yes, cancel order
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Details #{selectedPurchase?.id}
              </DialogTitle>
              <DialogDescription>
                Placed on {selectedPurchase && format(new Date(selectedPurchase.created_at), 'PPP')}
              </DialogDescription>
            </DialogHeader>

            {selectedPurchase && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge className={
                      selectedPurchase.status === 'completed' ? 'bg-green-500' : 
                      selectedPurchase.status === 'cancelled' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }>
                      {selectedPurchase.status.charAt(0).toUpperCase() + selectedPurchase.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Order Total</div>
                    <div className="text-xl font-bold">₱{Number(selectedPurchase.total_amount).toFixed(2)}</div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <h3 className="font-medium">Order Items</h3>
                  </div>
                  
                  <ScrollArea className="h-[300px]">
                    <div className="p-4">
                      {selectedPurchase.purchase_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                          <img 
                            src={item.products?.image || "/placeholder.svg"}
                            alt={item.products?.product_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.products?.product_name}</div>
                            <div className="text-sm text-gray-500">
                              ₱{Number(item.price_at_time).toFixed(2)} x {item.quantity}
                            </div>
                          </div>
                          <div className="font-medium">
                            ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
