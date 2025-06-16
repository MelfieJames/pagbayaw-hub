
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AlertCircle, CheckCircle, X, Clock, Truck, Package, AlertTriangle, User, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OrderStatus = "pending" | "approved" | "processing" | "delivering" | "completed" | "cancelled";

interface PurchaseItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  products: {
    product_name: string;
    image: string | null;
  };
}

interface Purchase {
  id: number;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  total_amount: number;
  user_id: string;
  email: string | null;
  transaction_details?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
  }[];
  purchase_items: PurchaseItem[];
  customerName?: string;
  customerEmail?: string;
}

export function OrderApproval() {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          transaction_details(*),
          purchase_items(*, products(*))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((purchase: any) => {
        const details = purchase.transaction_details?.[0];
        return {
          ...purchase,
          customerName: details ? `${details.first_name} ${details.last_name}` : purchase.email || "Anonymous",
          customerEmail: details?.email || purchase.email || "N/A",
        };
      }) as Purchase[];
    },
    refetchInterval: 30000,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
      trackingNumber = null,
    }: {
      orderId: number;
      newStatus: OrderStatus;
      trackingNumber?: string | null;
    }) => {
      const { error: updateError } = await supabase
        .from("purchases")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      let notificationMessage = "";
      let notificationType = "";

      switch (newStatus) {
        case "approved":
          notificationMessage = `Your order #${orderId} has been approved by admin.`;
          notificationType = "order";
          break;
        case "processing":
          notificationMessage = `Your order #${orderId} is now being processed.`;
          notificationType = "order";
          break;
        case "delivering":
          notificationMessage = `Your order #${orderId} is now out for delivery${trackingNumber ? ` with tracking number: ${trackingNumber}` : ''}.`;
          notificationType = trackingNumber ? "tracking_update" : "order";
          break;
        case "completed":
          notificationMessage = `Your order #${orderId} has been completed. Thank you for shopping with us!`;
          notificationType = "order";
          break;
      }

      if (notificationMessage) {
        const { data: purchaseData } = await supabase
          .from("purchases")
          .select("user_id")
          .eq("id", orderId)
          .single();

        if (purchaseData?.user_id) {
          await supabase.from("notifications").insert({
            user_id: purchaseData.user_id,
            purchase_id: orderId,
            message: notificationMessage,
            type: notificationType,
            tracking_number: trackingNumber,
            is_read: false
          });
        }
      }

      return { orderId, newStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      
      let successMessage = '';
      switch (data.newStatus) {
        case "approved":
          successMessage = "Order has been approved";
          break;
        case "processing":
          successMessage = "Order marked as processing";
          break;
        case "delivering":
          successMessage = "Order is now out for delivery";
          break;
        case "completed":
          successMessage = "Order marked as completed";
          break;
        case "cancelled":
          successMessage = "Order has been cancelled";
          break;
      }
      
      toast.success(successMessage);
      setIsProcessModalOpen(false);
      setIsViewModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });

  const handleApproveOrder = (purchase: Purchase) => {
    updateOrderStatus.mutate({ orderId: purchase.id, newStatus: "approved" });
  };

  const handleRejectOrder = (purchase: Purchase) => {
    updateOrderStatus.mutate({ orderId: purchase.id, newStatus: "cancelled" });
  };

  const handleProcessOrder = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    
    if (purchase.status === "approved") {
      updateOrderStatus.mutate({ orderId: purchase.id, newStatus: "processing" });
    } else if (purchase.status === "processing") {
      setIsProcessModalOpen(true);
    } else if (purchase.status === "delivering") {
      updateOrderStatus.mutate({ orderId: purchase.id, newStatus: "completed" });
    }
  };

  const handleSubmitTrackingNumber = () => {
    if (!selectedPurchase) return;
    
    updateOrderStatus.mutate({
      orderId: selectedPurchase.id,
      newStatus: "delivering",
      trackingNumber: trackingNumber
    });
  };

  const viewOrderDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsViewModalOpen(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending Approval</Badge>;
      case "approved":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Approved</Badge>;
      case "processing":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Processing</Badge>;
      case "delivering":
        return <Badge className="bg-[#C4A484] hover:bg-[#a68967]">Delivering</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "approved":
        return <CheckCircle className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "delivering":
        return <Truck className="h-5 w-5" />;
      case "completed":
        return <CheckCircle className="h-5 w-5" />;
      case "cancelled":
        return <X className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getNextActionButton = (purchase: Purchase) => {
    switch (purchase.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => handleApproveOrder(purchase)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleRejectOrder(purchase)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      case "approved":
        return (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-purple-500 hover:bg-purple-600"
            onClick={() => handleProcessOrder(purchase)}
          >
            <Package className="h-4 w-4 mr-1" />
            Start Processing
          </Button>
        );
      case "processing":
        return (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-[#C4A484] hover:bg-[#a68967]"
            onClick={() => handleProcessOrder(purchase)}
          >
            <Truck className="h-4 w-4 mr-1" />
            Ship Order
          </Button>
        );
      case "delivering":
        return (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleProcessOrder(purchase)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Completed
          </Button>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return order.status === "pending";
    if (activeTab === "processing") return order.status === "approved" || order.status === "processing";
    if (activeTab === "shipping") return order.status === "delivering";
    if (activeTab === "completed") return order.status === "completed";
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Package className="mx-auto h-12 w-12 opacity-20 mb-3" />
              <p>No orders in this category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((purchase) => (
                    <TableRow key={purchase.id} className="hover:bg-gray-50">
                      <TableCell className="font-semibold">#{purchase.id}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(purchase.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{purchase.customerName}</div>
                        <div className="text-xs text-gray-500">{purchase.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        ₱{Number(purchase.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(purchase.status)}
                          {getStatusBadge(purchase.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewOrderDetails(purchase)}
                          >
                            Details
                          </Button>
                          {getNextActionButton(purchase)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Order Details Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          {selectedPurchase && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {getStatusIcon(selectedPurchase.status)}
                  Order #{selectedPurchase.id}
                </DialogTitle>
                <DialogDescription>
                  Placed on {format(new Date(selectedPurchase.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Customer Information
                  </h3>
                  <p className="text-sm">Name: {selectedPurchase.customerName}</p>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gray-500" />
                    {selectedPurchase.customerEmail}
                  </p>
                  {selectedPurchase.transaction_details?.[0]?.phone_number && (
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-500" />
                      {selectedPurchase.transaction_details[0].phone_number}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-md border">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Shipping Information
                  </h3>
                  {selectedPurchase.transaction_details?.[0]?.address ? (
                    <p className="text-sm whitespace-pre-wrap">{selectedPurchase.transaction_details[0].address}</p>
                  ) : (
                    <p className="text-sm text-amber-600">No address provided</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedPurchase.purchase_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 border-b pb-2">
                      <img
                        src={item.products?.image || "/placeholder.svg"}
                        alt={item.products?.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.product_name}</p>
                        <p className="text-sm text-gray-500">₱{Number(item.price_at_time).toFixed(2)} × {item.quantity}</p>
                      </div>
                      <p className="font-medium">₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <p className="font-medium">Total</p>
                    <p className="font-bold">₱{Number(selectedPurchase.total_amount).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <div className="flex gap-2 w-full justify-between">
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                  <div className="flex gap-2">
                    {getNextActionButton(selectedPurchase)}
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Process to Shipping Dialog */}
      <Dialog open={isProcessModalOpen} onOpenChange={setIsProcessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shipping Information</DialogTitle>
            <DialogDescription>
              Enter the tracking number for this order to proceed to shipping.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F5F5DC]">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                  alt="J&T Express" 
                  className="h-10 w-10 object-contain rounded-full"
                />
              </div>
              <div>
                <p className="font-medium">J&T Express</p>
                <p className="text-xs text-gray-500">Tracking Number Required</p>
              </div>
            </div>
            
            <Input
              placeholder="Enter tracking number (e.g., JT1234567890)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
            
            {!trackingNumber && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Tracking number is required to proceed</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={!trackingNumber} 
              onClick={handleSubmitTrackingNumber}
              className="bg-[#C4A484] hover:bg-[#a68967]"
            >
              <Truck className="h-4 w-4 mr-1" />
              Ship Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
