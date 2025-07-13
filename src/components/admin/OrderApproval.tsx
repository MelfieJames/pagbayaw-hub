import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Truck,
  Check,
  Ban,
  List,
  Eye,
  X as CloseIcon,
  Loader2,
  Home,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-yellow-600" />,
  processing: <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />,
  delivering: <Truck className="h-4 w-4 text-blue-600" />,
  completed: <Check className="h-4 w-4 text-green-600" />,
  cancelled: <Ban className="h-4 w-4 text-red-600" />,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  delivering: "Delivering",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-400",
  processing: "bg-orange-400",
  delivering: "bg-blue-400",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const ALL_STATUSES = ["pending", "processing", "delivering", "completed", "cancelled"];

export function OrderApproval() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [activeStatus, setActiveStatus] = useState<string>('pending');
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingNumbers, setTrackingNumbers] = useState<{ [orderId: number]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [showJntModal, setShowJntModal] = useState(false);
  const [pendingTrackingOrder, setPendingTrackingOrder] = useState<{ orderId: number, trackingNumber: string } | null>(null);
  const [showDeliveringModal, setShowDeliveringModal] = useState(false);
  const [deliverOrderId, setDeliverOrderId] = useState<number | null>(null);
  const [showNotifiedModal, setShowNotifiedModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchValue(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch all orders with address data - improved query
  const { data: allOrders = [], isLoading, refetch } = useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          total_amount,
          created_at,
          user_id,
          status,
          cancellation_reason,
          user_address_id,
          purchase_items (
            id,
            quantity,
            price_at_time,
            products (
              id,
              product_name,
              image,
              product_price
            )
          ),
          user_addresses:user_address_id (
            id,
            recipient_name,
            address_name,
            address_line1,
            address_line2,
            purok,
            barangay,
            city,
            state_province,
            postal_code,
            country,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      return data || [];
    }
  });

  // Utility: get address for an order
  const getAddressForOrder = (order: any) => {
    // First try to get the address from the direct relationship
    if (order.user_addresses) {
      return order.user_addresses;
    }
    return null;
  };

  // Auto-cancel pending orders with missing address
  useEffect(() => {
    if (!allOrders || allOrders.length === 0) return;
    const toCancel = allOrders.filter(
      (order: any) => order.status === 'pending' && !hasCompleteAddress(order)
    );
    if (toCancel.length === 0) return;
    toCancel.forEach(async (order: any) => {
      await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', order.id);
      await supabase
        .from('notifications')
        .insert({
          user_id: order.user_id,
          type: 'order',
          message: `Your order #${order.id} has been cancelled due to incomplete address information. Please add a complete address and place the order again.`,
          purchase_id: order.id,
        });
    });
    refetch();
  }, [allOrders]);

  // Filter for pending orders
  const pendingOrders = allOrders.filter((order: any) => order.status === 'pending');

  // Search filter
  const filterOrders = (orders: any[]) => {
    if (!searchValue.trim()) return orders;
    const term = searchValue.trim().toLowerCase();
    return orders.filter(order => {
      const address = getAddressForOrder(order);
      const recipientName = address?.recipient_name?.toLowerCase() || "";
      const orderId = String(order.id);
      return recipientName.includes(term) || orderId.includes(term);
    });
  };

  // Check if order has complete address information
  const hasCompleteAddress = (order: any) => {
    const address = getAddressForOrder(order);
    if (!address) return false;
    return !!(
      address.recipient_name &&
      address.address_line1 &&
      address.barangay &&
      address.city &&
      address.state_province &&
      address.postal_code &&
      address.country &&
      address.phone_number
    );
  };

  // Check if order has any address information (not strict completeness)
  const hasAnyAddress = (order: any) => {
    const address = getAddressForOrder(order);
    return !!address;
  };

  // Approve logic: handles both pending -> processing and processing -> delivering
  const handleApprove = async (orderId: number) => {
    setApprovingId(orderId);
    try {
      const order = allOrders.find((o: any) => o.id === orderId);
      if (order.status === 'pending') {
        // Only require any address, not strict completeness
        if (!hasAnyAddress(order)) {
          // Auto-cancel order due to missing address
          const { error } = await supabase
            .from('purchases')
            .update({ status: 'cancelled' })
            .eq('id', orderId);
          if (error) throw error;
          await supabase
            .from('notifications')
            .insert({
              user_id: order?.user_id,
              type: 'order',
              message: `Your order #${orderId} has been cancelled due to missing address information. Please add a delivery address and place the order again.`,
              purchase_id: orderId
            });
          toast.error("Order cancelled due to missing address information");
          refetch();
          return;
        }
        // Move to processing
        const { error } = await supabase
          .from('purchases')
          .update({ status: 'processing' })
          .eq('id', orderId);
        if (error) throw error;
        await supabase
          .from('notifications')
          .insert({
            user_id: order?.user_id,
            type: 'order',
            message: `Your order #${orderId} is now being processed.`,
            purchase_id: orderId
          });
        toast.success("Order moved to processing");
        refetch();
      } else if (order.status === 'processing') {
        setDeliverOrderId(orderId);
        setShowDeliveringModal(true);
        setApprovingId(null);
        return;
      }
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Failed to update order status");
    } finally {
      setApprovingId(null);
    }
  };

  // Disapprove logic for processing orders
  const handleDisapprove = async (orderId: number) => {
    setRejectingId(orderId);
    try {
      const order = allOrders.find((o: any) => o.id === orderId);
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
      await supabase
        .from('notifications')
        .insert({
          user_id: order?.user_id,
          type: 'order',
          message: `Your order #${orderId} has been cancelled.`,
          purchase_id: orderId
        });
      toast.success("Order cancelled successfully");
      refetch();
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setRejectingId(null);
    }
  };

  // Move to delivering with tracking number (after J&T modal confirm)
  const handleMoveToDelivering = async (orderId: number, trackingNumber: string) => {
    setApprovingId(orderId);
    try {
      const order = allOrders.find((o: any) => o.id === orderId);
      setTrackingNumbers((prev) => ({ ...prev, [orderId]: trackingNumber }));
      await supabase
        .from('notifications')
        .insert({
          user_id: order?.user_id,
          type: 'order',
          message: `Your order #${orderId} is now out for delivery! Tracking number: ${trackingNumber}`,
          purchase_id: orderId,
          tracking_number: trackingNumber,
        });
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'delivering' })
        .eq('id', orderId);
      if (error) throw error;
      toast.success("Order moved to delivering");
      refetch();
      setShowJntModal(false);
      setPendingTrackingOrder(null);
      setTrackingInput("");
      setShowNotifiedModal(true);
    } catch (error) {
      console.error("Error moving to delivering:", error);
      toast.error("Failed to move to delivering");
    } finally {
      setApprovingId(null);
    }
  };

  // Mark as completed
  const handleMarkCompleted = async (orderId: number) => {
    setApprovingId(orderId);
    try {
      const order = allOrders.find((o: any) => o.id === orderId);
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', orderId);
      if (error) throw error;
      await supabase
        .from('notifications')
        .insert({
          user_id: order?.user_id,
          type: 'order',
          message: `Your order #${orderId} has been marked as completed.`,
          purchase_id: orderId
        });
      toast.success("Order marked as completed");
      refetch();
    } catch (error) {
      console.error("Error marking as completed:", error);
      toast.error("Failed to mark as completed");
    } finally {
      setApprovingId(null);
    }
  };

  const confirmMoveToDelivering = async () => {
    if (!deliverOrderId) return;
    setApprovingId(deliverOrderId);
    try {
      const order = allOrders.find((o: any) => o.id === deliverOrderId);
      await supabase
        .from('purchases')
        .update({ status: 'delivering' })
        .eq('id', deliverOrderId);
      await supabase
        .from('notifications')
        .insert({
          user_id: order?.user_id,
          type: 'order',
          message: `Your order #${deliverOrderId} is now out for delivery. Please expect your package soon.`,
          purchase_id: deliverOrderId
        });
      toast.success("Order moved to delivering");
      refetch();
      setShowDeliveringModal(false);
      setDeliverOrderId(null);
    } catch (error) {
      console.error("Error moving to delivering:", error);
      toast.error("Failed to move to delivering");
    } finally {
      setApprovingId(null);
    }
  };

  // Tab UI
  const renderTabs = () => (
    <div className="flex border-b border-amber-700 mb-4">
      <button
        className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === 'pending' ? 'text-amber-800 border-b-2 border-amber-700 bg-amber-50' : 'text-gray-500 hover:text-amber-800'}`}
        onClick={() => setActiveTab('pending')}
      >
        <Clock className="h-5 w-5" /> Pending Orders
      </button>
      <button
        className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === 'all' ? 'text-amber-800 border-b-2 border-amber-700 bg-amber-50' : 'text-gray-500 hover:text-amber-800'}`}
        onClick={() => setActiveTab('all')}
      >
        <List className="h-5 w-5" /> All Orders
      </button>
    </div>
  );

  const renderStatusFilter = () => (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {ALL_STATUSES.map((status) => (
        <button
          key={status}
          className={`flex items-center gap-1 px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
            activeStatus === status
              ? 'bg-amber-50 border-amber-700 text-amber-800 font-semibold'
              : 'bg-white border-gray-200 text-gray-500 hover:text-amber-800'
          }`}
          onClick={() => setActiveStatus(status)}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${STATUS_COLORS[status]}`}></span>
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );

  // Order Card
  const renderOrderCard = (order: any) => {
    const address = getAddressForOrder(order);
    const hasCompleteInfo = hasCompleteAddress(order);
    const hasAddress = hasAnyAddress(order);
    const status = order.status;
    const customerName = address?.recipient_name || "Unknown";
    return (
      <div key={order.id} className="w-full bg-white shadow-md rounded-lg p-4 border border-amber-200 mb-4 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}></span>
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              {customerName} (Order #{order.id})
              <span>{STATUS_ICONS[status] || <Package className="h-4 w-4 text-gray-400" />}</span>
              {!hasAddress && status === 'pending' && (
                <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded">No Address</span>
              )}
            </h4>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p className="text-lg font-semibold text-amber-800">
              ₱{Number(order.total_amount).toFixed(2)}
            </p>
            {status === 'cancelled' && (
              <p className="text-xs text-red-700 font-medium mt-1">
                Cancellation Reason: {order.cancellation_reason ? order.cancellation_reason : 'No reason provided.'}
              </p>
            )}
          </div>
          {/* Show NOT APPROVED only if address is missing or incomplete */}
          {status === 'pending' && !hasCompleteInfo && (
            <span className="ml-4 px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">NOT APPROVED</span>
          )}
          {status !== 'pending' && (
            <Badge variant="outline" className={
              status === 'processing' ? 'border-orange-400 text-orange-700' :
              status === 'delivering' ? 'border-blue-400 text-blue-700' :
              status === 'completed' ? 'border-green-400 text-green-700' :
              status === 'cancelled' ? 'border-red-400 text-red-700' :
              'border-gray-300 text-gray-500'
            }>
              {STATUS_LABELS[status] || status}
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(order.id)}
                disabled={approvingId === order.id}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {approvingId === order.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDisapprove(order.id)}
                disabled={rejectingId === order.id}
              >
                {rejectingId === order.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </>
                )}
              </Button>
            </>
          )}
          {status === 'processing' && (
            <>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setShowJntModal(true);
                  setPendingTrackingOrder({ orderId: order.id, trackingNumber: "" });
                  setTrackingInput("");
                }}
              >
                Move to Delivering
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDisapprove(order.id)}
                disabled={rejectingId === order.id}
              >
                {rejectingId === order.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Disapprove
                  </>
                )}
              </Button>
            </>
          )}
          {status === 'delivering' && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleMarkCompleted(order.id)}
              disabled={approvingId === order.id}
            >
              {approvingId === order.id ? <LoadingSpinner size="sm" /> : 'Mark as Completed'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedOrder(order);
              setModalOpen(true);
            }}
            className="flex items-center gap-1 border-amber-200 hover:bg-amber-50"
          >
            <Eye className="h-4 w-4 mr-1" /> View Details
          </Button>
        </div>
      </div>
    );
  };

  // Modal for order details - improved address display
  const renderOrderModal = () => {
    if (!selectedOrder) return null;
    const address = getAddressForOrder(selectedOrder);
    const status = selectedOrder.status;
    let trackingNumber = trackingNumbers[selectedOrder.id] || "";
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative border-2 border-amber-200">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            onClick={() => setModalOpen(false)}
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-amber-800">
            {address?.recipient_name || `Order #${selectedOrder.id}`} (Order #{selectedOrder.id})
            <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}></span>
            <span>{STATUS_LABELS[status]}</span>
          </h3>
          {(status === 'delivering' || status === 'completed') && trackingNumber && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-1">Tracking Number</h4>
              <div className="text-blue-700 font-mono text-lg">{trackingNumber}</div>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-4">
            Placed on {new Date(selectedOrder.created_at).toLocaleString()}
          </p>
          <div className="mb-4">
            <h4 className="font-semibold text-amber-800 mb-1 flex items-center gap-2">
              <Home className="h-4 w-4" /> Delivery Address
            </h4>
            {/* Cancellation Reason for Cancelled Orders */}
            {status === 'cancelled' && selectedOrder.cancellation_reason && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-800 mb-1">Cancellation Reason:</p>
                <p className="text-sm text-red-700">{selectedOrder.cancellation_reason}</p>
              </div>
            )}
            {address ? (
              <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-500" />
                  <span className={!address.recipient_name ? "text-red-600" : "text-gray-700"}>
                    Name: {address.recipient_name || "Missing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">
                    Address Name: {address.address_name || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className={!address.address_line1 ? "text-red-600" : "text-gray-700"}>
                    Street: {address.address_line1 || "Missing"}
                  </span>
                </div>
                {address.address_line2 && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">Address Line 2: {address.address_line2}</span>
                  </div>
                )}
                {address.purok && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">Purok: {address.purok}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className={!address.barangay ? "text-red-600" : "text-gray-700"}>
                    Barangay: {address.barangay || "Missing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className={!address.city ? "text-red-600" : "text-gray-700"}>
                    City: {address.city || "Missing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className={!address.state_province ? "text-red-600" : "text-gray-700"}>
                    Province: {address.state_province || "Missing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className={!address.postal_code ? "text-red-600" : "text-gray-700"}>
                    Postal Code: {address.postal_code || "Missing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  <span className={!address.country ? "text-red-600" : "text-gray-700"}>
                    Country: {address.country || "Missing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-500" />
                  <span className={!address.phone_number ? "text-red-600" : "text-gray-700"}>
                    Phone: {address.phone_number || "Missing"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-red-600 bg-red-50 p-3 rounded-md">
                No delivery address available for this order.
              </div>
            )}
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-amber-800 mb-1">Order Items</h4>
            <div className="space-y-1">
              {selectedOrder.purchase_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.products?.product_name} × {item.quantity}</span>
                  <span>₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold text-amber-800 text-lg">
              Total: ₱{Number(selectedOrder.total_amount).toFixed(2)}
            </span>
            <Badge variant="outline" className={
              status === 'pending' ? 'border-yellow-400 text-yellow-700' :
              status === 'processing' ? 'border-orange-400 text-orange-700' :
              status === 'delivering' ? 'border-blue-400 text-blue-700' :
              status === 'completed' ? 'border-green-400 text-green-700' :
              status === 'cancelled' ? 'border-red-400 text-red-700' :
              'border-gray-300 text-gray-500'
            }>
              {STATUS_LABELS[status] || status}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const renderJntModal = () => {
    if (!pendingTrackingOrder) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-xs w-full p-6 relative flex flex-col items-center border-2 border-amber-200">
          <img src="/lovable-uploads/jnt.png" alt="J&T Logo" className="h-16 mb-4" />
          <h3 className="text-lg font-bold mb-2 text-center text-amber-800">Send with J&T Express</h3>
          <input
            type="text"
            className="border border-amber-300 rounded px-2 py-1 text-sm mb-4 w-full focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
            placeholder="Tracking number"
            value={trackingInput}
            onChange={e => setTrackingInput(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 w-full justify-center">
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white w-full"
              disabled={!trackingInput || approvingId === pendingTrackingOrder.orderId}
              onClick={() => handleMoveToDelivering(pendingTrackingOrder.orderId, trackingInput)}
            >
              {approvingId === pendingTrackingOrder.orderId ? <LoadingSpinner size="sm" /> : 'Confirm & Move to Delivering'}
            </Button>
            <Button
              variant="outline"
              className="border-amber-300 hover:bg-amber-50"
              onClick={() => { setShowJntModal(false); setPendingTrackingOrder(null); setTrackingInput(""); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderNotifiedModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-xs w-full p-8 relative flex flex-col items-center text-center border-2 border-amber-200">
        <div className="bg-green-100 rounded-full p-4 mb-4 flex items-center justify-center">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-green-700">Customer Notified!</h3>
        <p className="mb-6 text-gray-700">
          The customer has been notified with the tracking details.<br />
          <span className="font-semibold">They will receive a message with their tracking number and delivery status. Thank you for keeping your customers updated!</span>
        </p>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white w-full"
          onClick={() => setShowNotifiedModal(false)}
        >
          Close
        </Button>
      </div>
    </div>
  );

  // Main Render
  if (isLoading) {
    return (
      <Card className="border-amber-700 bg-white">
        <CardContent className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  let ordersToShow = activeTab === 'pending'
    ? filterOrders(pendingOrders)
    : filterOrders(allOrders.filter((order: any) => order.status === activeStatus));

  return (
    <Card className="border-amber-700 bg-white shadow-lg">
      <CardHeader className="bg-amber-100 border-b border-amber-200">
        <CardTitle className="text-amber-800 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex justify-center items-center p-4 pb-0">
          <input
            type="text"
            className="border-2 border-amber-700 rounded-2xl px-5 py-3 text-base w-full max-w-lg text-center shadow focus:border-amber-800 focus:ring-2 focus:ring-amber-200 bg-white placeholder-gray-400"
            placeholder="Search by recipient name or order number"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {renderTabs()}
        {activeTab === 'all' && renderStatusFilter()}
        {ordersToShow.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto p-4">
            {ordersToShow.map((order: any) => renderOrderCard(order))}
          </div>
        )}
        {modalOpen && renderOrderModal()}
        {showJntModal && renderJntModal()}
        {showNotifiedModal && renderNotifiedModal()}
      </CardContent>
    </Card>
  );
}
