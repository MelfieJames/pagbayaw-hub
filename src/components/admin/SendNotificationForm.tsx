
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, Truck, Hash, Pencil, User, Search, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
}

export default function SendNotificationForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name");

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users. Please try again later.");
        return;
      }

      const formattedUsers = data.map((user) => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      }));

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    };

    fetchUsers();
  }, []);

  // Fetch pending orders when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchPendingOrders(selectedUserId);
    } else {
      setPendingOrders([]);
    }
  }, [selectedUserId]);

  const fetchPendingOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id, 
          total_amount, 
          created_at, 
          status,
          purchase_items(
            id,
            quantity,
            products(
              id,
              name,
              price
            )
          )
        `)
        .eq("user_id", userId)
        .eq("status", "pending");

      if (error) throw error;
      setPendingOrders(data || []);
      
      // Auto-select the order if there's only one
      if (data && data.length === 1) {
        setSelectedOrderId(data[0].id);
        setSelectedOrderDetails(data[0]);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      toast.error("Failed to load pending orders");
    }
  };

  const getFullName = (user: User) =>
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      getFullName(user).toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSend = async () => {
    if (!selectedUserId || !message.trim() || !selectedOrderId) {
      toast.error("Please fill all required fields and select an order.");
      return;
    }

    setLoading(true);
    try {
      // Send the message exactly as typed by the admin, no formatting or prepending/appending
      const formattedMessage = message.trim();

      const notificationData: any = {
        user_id: selectedUserId,
        message: formattedMessage,
        type: "tracking_update",
        purchase_id: selectedOrderId
      };

      // Add expected delivery date to the notification record only (not to the message)
      if (expectedDeliveryDate.trim()) {
        notificationData.expected_delivery_date = expectedDeliveryDate.trim();
      }

      const { error } = await supabase.from("notifications").insert([notificationData]);

      if (error) throw error;

      // Update the order status to "shipped"
      const { error: updateError } = await supabase
        .from("purchases")
        .update({ status: "shipped" })
        .eq("id", selectedOrderId);

      if (updateError) throw updateError;

      setShowSuccessModal(true);
      setMessage("");
      setExpectedDeliveryDate("");
      setSearchTerm("");
      setSelectedUserId("");
      setSelectedOrderId("");
      setPendingOrders([]);
      setSelectedOrderDetails(null);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto shadow-lg bg-[#fdfbf7] border-[#e5e2dd]">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
            alt="JNT Logo" 
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-[#8B7355]">Send Tracking Update</h2>
            <p className="text-sm text-gray-500">Update customers on their shipment status</p>
          </div>
        </div>

        <div>
          <Label className="text-[#8B7355] flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Customer
          </Label>
          <Input
            placeholder="Enter name or email to search..."
            value={searchTerm}
            onChange={handleSearch}
            className="mt-1"
          />
          {searchTerm && (
            <div className="border mt-2 rounded-md max-h-40 overflow-y-auto bg-white shadow">
              {filteredUsers.length > 0 &&
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#f5f5dc] ${
                      selectedUserId === user.id ? "bg-[#f5f5dc] font-semibold" : ""
                    }`}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSearchTerm(getFullName(user));
                      setFilteredUsers([]);
                    }}
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span>{getFullName(user)} ({user.email})</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {selectedUserId && pendingOrders.length > 0 && (
          <div>
            <Label className="text-[#8B7355] flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Select Order
            </Label>
            <Select 
              value={selectedOrderId} 
              onValueChange={(value) => {
                setSelectedOrderId(value);
                const order = pendingOrders.find(o => o.id === value);
                setSelectedOrderDetails(order);
              }}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose an order" />
              </SelectTrigger>
              <SelectContent>
                {pendingOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    Order #{order.id} - ₱{order.total_amount.toFixed(2)} - {new Date(order.created_at).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedOrderDetails && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm">
                  <strong>Order Items:</strong><br />
                  {selectedOrderDetails.purchase_items?.map((item: any, index: number) => (
                    <div key={item.id} className="ml-2">
                      • {item.quantity}x {item.products?.name} - ₱{item.products?.price}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedUserId && selectedOrderDetails && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm">
              {/* Get the selected user's profile for name and email */}
              {(() => {
                const selectedUser = users.find(u => u.id === selectedUserId);
                const userFullName = selectedUser ? getFullName(selectedUser) : 'Unknown';
                const userEmail = selectedUser ? selectedUser.email : 'Unknown';
                return (
                  <>
                    <strong>Selected Order:</strong> #{selectedOrderDetails.id}<br />
                    <strong>Customer:</strong> {userFullName}<br />
                    <strong>Email:</strong> {userEmail}<br />
                    <strong>Total:</strong> ₱{Number(selectedOrderDetails.total_amount).toFixed(2)}<br />
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {selectedUserId && pendingOrders.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-700">
            No pending orders found for this customer.
          </div>
        )}

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
            <Pencil className="w-4 h-4" />
            Message
          </Label>
          <Textarea
            placeholder={`Your order has been processed!\n\nItems ordered:\n${selectedOrderDetails?.purchase_items?.map((item: any) => `• ${item.quantity}x ${item.products?.name}`).join('\n') || '• [Items will appear here]'}\n`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1"
            rows={6}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={loading || !selectedUserId || !message.trim() || !selectedOrderId}
          className="w-full bg-[#8B7355] hover:bg-[#7a624d] text-white"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Sending...
            </>
          ) : (
            <>
              <BellRing className="w-4 h-4 mr-2" />
              Send Tracking Notification
            </>
          )}
        </Button>
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <DialogTitle>Notification Sent!</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-gray-700">
              The tracking notification was sent successfully to the customer.
            </div>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full bg-[#8B7355] hover:bg-[#7a624d] text-white mt-2">OK</Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
