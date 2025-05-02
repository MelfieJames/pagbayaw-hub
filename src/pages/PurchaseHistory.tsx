
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import Navbar from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingBag, Package, Calendar, Search, X, AlertCircle } from "lucide-react";
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
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
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

      if (error) throw error;
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

      // Step 3: Restore inventory quantities
      const purchaseItems = purchaseData.purchase_items;
      for (const item of purchaseItems) {
        const { error: inventoryError } = await supabase.rpc(
          'increment_inventory',
          { 
            p_product_id: item.product_id, 
            p_quantity: item.quantity 
          }
        );

        if (inventoryError) {
          console.error('Error updating inventory:', inventoryError);
          // Continue with other items even if this one fails
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

  const filteredPurchases = purchases.filter(purchase => {
    if (!searchTerm) return true;
    
    // Search by purchase ID
    if (purchase.id.toString().includes(searchTerm)) return true;
    
    // Search by product name
    return purchase.purchase_items?.some(item => 
      item.products?.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" /> Purchase History
        </h1>

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
                    {purchase.purchase_items?.map((item: any) => (
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
                  </div>
                  <div className="p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="text-sm text-gray-500">Total</span>
                      <div className="font-bold">₱{Number(purchase.total_amount).toFixed(2)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
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
      </div>
    </div>
  );
}
