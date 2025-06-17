
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Package, User, Mail, Phone, MapPin } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";

export function OrderApproval() {
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
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
          profiles!purchases_user_id_fkey (
            first_name,
            last_name,
            email,
            phone_number,
            location
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleApprove = async (orderId: number) => {
    setApprovingId(orderId);
    try {
      // First check if customer has complete information
      const order = orders.find(o => o.id === orderId);
      const profile = order?.profiles;
      
      if (!profile?.first_name || !profile?.last_name || !profile?.phone_number || !profile?.location) {
        // Auto-cancel order due to incomplete customer information
        const { error } = await supabase
          .from('purchases')
          .update({ status: 'cancelled' })
          .eq('id', orderId);

        if (error) throw error;

        // Send notification about cancellation
        await supabase
          .from('notifications')
          .insert({
            user_id: order?.user_id,
            type: 'order',
            message: `Your order #${orderId} has been cancelled due to incomplete profile information. Please complete your profile and place the order again.`,
            purchase_id: orderId
          });

        toast.error("Order cancelled due to incomplete customer information");
        refetch();
        return;
      }

      const { error } = await supabase
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', orderId);

      if (error) throw error;

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          user_id: order?.user_id,
          type: 'order',
          message: `Your order #${orderId} has been approved and is being processed.`,
          purchase_id: orderId
        });

      toast.success("Order approved successfully");
      refetch();
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Failed to approve order");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (orderId: number) => {
    setRejectingId(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          user_id: order?.user_id,
          type: 'order',
          message: `Your order #${orderId} has been cancelled.`,
          purchase_id: orderId
        });

      toast.success("Order rejected successfully");
      refetch();
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error("Failed to reject order");
    } finally {
      setRejectingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-[#C4A484]">
        <CardContent className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <CardTitle className="text-[#8B7355] flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Orders ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>No pending orders</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {orders.map((order) => {
              const profile = order.profiles;
              const hasCompleteInfo = profile?.first_name && profile?.last_name && profile?.phone_number && profile?.location;
              
              return (
                <div key={order.id} className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-semibold text-[#8B7355]">
                        ₱{Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700">
                      Pending
                    </Badge>
                  </div>

                  {/* Customer Information */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className={!profile?.first_name || !profile?.last_name ? "text-red-600" : "text-gray-700"}>
                          Name: {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-700">Email: {order.email || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span className={!profile?.phone_number ? "text-red-600" : "text-gray-700"}>
                          Phone: {profile?.phone_number || "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className={!profile?.location ? "text-red-600" : "text-gray-700"}>
                          Address: {profile?.location || "Missing"}
                        </span>
                      </div>
                    </div>
                    {!hasCompleteInfo && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        ⚠️ Customer information is incomplete. Order will be auto-cancelled if approved with missing info.
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-800 mb-2">Items:</h5>
                    <div className="space-y-1">
                      {order.purchase_items?.map((item: any) => (
                        <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.products?.product_name} × {item.quantity}</span>
                          <span>₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(order.id)}
                      disabled={approvingId === order.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
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
                      onClick={() => handleReject(order.id)}
                      disabled={rejectingId === order.id}
                    >
                      {rejectingId === order.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
