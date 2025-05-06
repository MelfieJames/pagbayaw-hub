
import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, Truck, Hash, Pencil, Search, Filter, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

interface CustomerData {
  id: string;
  email: string;
  full_name: string;
  purchase_id: string; // This property is needed
}

interface NotificationData {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
  tracking_number?: string;
}

export default function AdminNotificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [purchaseId, setPurchaseId] = useState<string>("");
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [activeTab, setActiveTab] = useState("send");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch customers who have pending or approved orders
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            id,
            user_id,
            email,
            profiles(
              first_name,
              last_name
            )
          `)
          .in('status', ['pending', 'approved']);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedCustomers = data.map(purchase => {
            // Correctly access properties from the profiles object
            const profileData = Array.isArray(purchase.profiles) 
              ? purchase.profiles[0] 
              : purchase.profiles;
              
            const firstName = profileData?.first_name || '';
            const lastName = profileData?.last_name || '';
            
            return {
              id: purchase.user_id,
              email: purchase.email || '',
              full_name: `${firstName} ${lastName}`.trim() || purchase.email || 'Unknown',
              purchase_id: purchase.id
            };
          });

          setCustomers(formattedCustomers);
          setFilteredCustomers(formattedCustomers);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers");
      }
    };

    fetchCustomers();
  }, []);

  // Fetch all notifications
  useEffect(() => {
    if (activeTab === "manage") {
      fetchNotifications();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(
      customer => 
        customer.full_name.toLowerCase().includes(value) || 
        customer.email.toLowerCase().includes(value)
    );
    
    setFilteredCustomers(filtered);
  };

  const handleDeleteNotification = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      toast.success("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!purchaseId) {
      toast.error("Please select a purchase ID");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: selectedCustomerId,
          message: `${message.trim()} - TRACKING NUMBER: ${trackingNumber.trim()}`,
          tracking_number: trackingNumber.trim(),
          type: "tracking_update",
          purchase_id: purchaseId
        },
      ]);

      if (error) throw error;

      // Also update the purchase status to 'shipped'
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'delivering' })
        .eq('id', purchaseId);

      if (updateError) throw updateError;

      toast.success("Tracking notification sent successfully!");
      setMessage("");
      setTrackingNumber("");
      setSearchTerm("");
      setSelectedCustomerId("");
      setPurchaseId("");
      
      // Remove the shipped order from the list
      setCustomers(prev => prev.filter(customer => customer.purchase_id !== purchaseId));
      setFilteredCustomers(prev => prev.filter(customer => customer.purchase_id !== purchaseId));
      
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#8B7355] mb-2">Notification Management</h2>
          <p className="text-gray-600 mb-6">Send and manage customer notifications</p>
          
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'send' ? 'border-b-2 border-[#8B7355] text-[#8B7355]' : 'text-gray-500'}`}
              onClick={() => setActiveTab('send')}
            >
              Send Tracking Updates
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'manage' ? 'border-b-2 border-[#8B7355] text-[#8B7355]' : 'text-gray-500'}`}
              onClick={() => setActiveTab('manage')}
            >
              Manage Notifications
            </button>
          </div>
          
          {activeTab === 'send' ? (
            <Card className="shadow-lg bg-[#fdfbf7] border-[#e5e2dd]">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                    alt="JNT Logo" 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-[#8B7355]">Send Tracking Update</h2>
                    <p className="text-sm text-gray-500">Update customers on their order shipment status</p>
                  </div>
                </div>

                <div>
                  <Label className="text-[#8B7355] flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4" />
                    Search Customer
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="mb-2"
                    />
                    {searchTerm && filteredCustomers.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id + customer.purchase_id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setSearchTerm(customer.full_name);
                              setPurchaseId(customer.purchase_id);
                            }}
                          >
                            <div>
                              <div className="font-medium">{customer.full_name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                            <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              Order #{customer.purchase_id}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchTerm && filteredCustomers.length === 0 && (
                      <div className="border p-3 rounded-md bg-gray-50 text-gray-500 text-sm">
                        No customers found with that name or email
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-[#8B7355] flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Tracking Number
                  </Label>
                  <Input
                    placeholder="Enter shipping tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[#8B7355] flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Message
                  </Label>
                  <Textarea
                    placeholder="Your order has been shipped! Track your package using the tracking number below."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleSendNotification}
                  disabled={isLoading}
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
          ) : (
            <Card className="shadow-lg bg-[#fdfbf7] border-[#e5e2dd]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-[#8B7355]" />
                  All Notifications
                </h3>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No notifications found
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 border rounded-md bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{new Date(notification.created_at).toLocaleString()}</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                {notification.type}
                              </span>
                              {notification.tracking_number && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                                  Tracking: {notification.tracking_number}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            disabled={isDeleting}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
