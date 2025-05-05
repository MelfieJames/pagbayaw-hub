
import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, Truck, Hash, Pencil, Search, Filter } from "lucide-react";
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
  purchase_id: string; // Add purchase_id property to the interface
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

  // Fetch customers who have pending orders
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            id,
            user_id,
            email,
            profiles!inner(
              first_name,
              last_name
            )
          `)
          .eq('status', 'pending');

        if (error) {
          throw error;
        }

        if (data) {
          const formattedCustomers = data.map(purchase => {
            // Correctly access properties from the purchase.profiles object
            const firstName = purchase.profiles?.first_name || '';
            const lastName = purchase.profiles?.last_name || '';
            
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
        .update({ status: 'shipped' })
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
          <h2 className="text-2xl font-semibold text-[#8B7355] mb-2">Send Shipping Updates</h2>
          <p className="text-gray-600 mb-6">Send tracking information to customers with pending orders</p>
          
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
        </div>
      </div>
    </div>
  );
}
