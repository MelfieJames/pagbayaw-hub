
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Search, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface OrderData {
  id: string;
  email: string;
  user_id: string;
  customerName: string;
  total_amount: number;
  status: string;
  tracking_number?: string;
}

export function TrackingNotificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [rawMessage, setRawMessage] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);

  // Fetch orders with status 'delivering' (shipped orders)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const { data: purchasesData, error } = await supabase
          .from('purchases')
          .select(`
            id,
            user_id,
            email,
            total_amount,
            status
          `)
          .eq('status', 'delivering');

        if (error) {
          throw error;
        }

        if (purchasesData) {
          // Get user details and existing tracking numbers from notifications
          const userIds = [...new Set(purchasesData.map(p => p.user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', userIds);

          const { data: transactionDetails } = await supabase
            .from('transaction_details')
            .select('purchase_id, first_name, last_name, email')
            .in('purchase_id', purchasesData.map(p => p.id));

          // Get tracking numbers from notifications
          const { data: notifications } = await supabase
            .from('notifications')
            .select('purchase_id, tracking_number')
            .in('purchase_id', purchasesData.map(p => p.id))
            .eq('type', 'tracking_update')
            .not('tracking_number', 'is', null);

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          const transactionMap = new Map(transactionDetails?.map(t => [t.purchase_id, t]) || []);
          const trackingMap = new Map(notifications?.map(n => [n.purchase_id, n.tracking_number]) || []);

          const formattedOrders = purchasesData.map(purchase => {
            const transaction = transactionMap.get(purchase.id);
            const profile = profileMap.get(purchase.user_id);
            const existingTracking = trackingMap.get(purchase.id);
            
            let customerName = "Unknown Customer";
            let customerEmail = purchase.email || "unknown@email.com";

            if (transaction) {
              customerName = `${transaction.first_name} ${transaction.last_name}`;
              customerEmail = transaction.email;
            } else if (profile) {
              customerName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || customerEmail.split('@')[0];
              customerEmail = profile.email || customerEmail;
            }

            return {
              id: purchase.id.toString(),
              email: customerEmail,
              user_id: purchase.user_id,
              customerName,
              total_amount: purchase.total_amount,
              status: purchase.status,
              tracking_number: existingTracking
            };
          });

          setAllOrders(formattedOrders);
          setFilteredOrders(formattedOrders);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredOrders(allOrders);
      setShowDropdown(false);
      setSelectedOrder(null);
      return;
    }
    
    const filtered = allOrders.filter(
      order => order.id.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredOrders(filtered);
    setShowDropdown(true);
  };

  const handleSelectOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setSearchTerm(`Order #${order.id}`);
    setShowDropdown(false);
  };

  const fullMessage = expectedDeliveryDate
    ? `${rawMessage.trim()}  Expected delivery date: ${expectedDeliveryDate}`
    : rawMessage;

  const handleSendNotification = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order");
      return;
    }
    if (!rawMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (!expectedDeliveryDate) {
      toast.error("Please enter expected delivery date");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: selectedOrder.user_id,
          message: fullMessage,
          type: "tracking_update",
          purchase_id: parseInt(selectedOrder.id),
          expected_delivery_date: expectedDeliveryDate
        },
      ]);
      if (error) throw error;
      toast.success("Notification sent successfully!");
      setRawMessage("");
      setExpectedDeliveryDate("");
      setSearchTerm("");
      setSelectedOrder(null);
      alert("Notification has been successfully sent to the customer!");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg bg-[#fdfbf7] border-[#C4A484]">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
            alt="JNT Logo" 
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-[#8B7355]">Send Tracking Update</h2>
            <p className="text-sm text-gray-500">Update customers on their shipped order status with delivery expectations</p>
          </div>
        </div>

        <div>
          <Label className="text-[#8B7355] flex items-center gap-2 mb-2">
            <Search className="w-4 h-4" />
            Search Order Number
          </Label>
          <div className="relative">
            <Input
              placeholder="Search by order number (e.g., 123)"
              value={searchTerm}
              onChange={handleSearch}
              className="mb-2"
              onFocus={() => searchTerm && setShowDropdown(true)}
            />
            {showDropdown && searchTerm && filteredOrders.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectOrder(order)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="text-sm text-gray-600">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                        {order.tracking_number && (
                          <div className="text-xs text-[#8B7355]">Tracking: {order.tracking_number}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₱{Number(order.total_amount).toFixed(2)}</div>
                        <div className="text-xs bg-[#8B7355] text-white px-2 py-1 rounded capitalize">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchTerm && filteredOrders.length === 0 && (
              <div className="border p-3 rounded-md bg-gray-50 text-gray-500 text-sm">
                No shipped orders found
              </div>
            )}
          </div>
          
          {selectedOrder && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm">
                <strong>Selected Order:</strong> #{selectedOrder.id}<br />
                <strong>Customer:</strong> {selectedOrder.customerName}<br />
                <strong>Email:</strong> {selectedOrder.email}<br />
                <strong>Total:</strong> ₱{Number(selectedOrder.total_amount).toFixed(2)}<br />
              </div>
            </div>
          )}
        </div>

        <div>
          <Label className="text-[#8B7355] flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Expected Delivery Date
          </Label>
          <Input
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            className="mt-1"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <Label className="text-[#8B7355] flex items-center gap-2">
            Message
          </Label>
          <Input
            placeholder="Your order has been shipped!"
            value={fullMessage}
            onChange={e => setRawMessage(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleSendNotification}
          disabled={isLoading || !selectedOrder}
          className="w-full bg-[#8B7355] hover:bg-[#7a624d] text-white"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Sending...
            </>
          ) : (
            <>
              <Truck className="mr-2 h-4 w-4" /> Send Tracking Update
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
