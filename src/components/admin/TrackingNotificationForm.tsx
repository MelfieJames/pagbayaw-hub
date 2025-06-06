
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Hash, Pencil, Search, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface CustomerData {
  id: string;
  email: string;
  purchase_id: string;
}

export function TrackingNotificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [message, setMessage] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [purchaseId, setPurchaseId] = useState<string>("");
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch customers who have pending or approved orders
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            id,
            user_id,
            email
          `)
          .in('status', ['pending', 'approved']);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedCustomers = data.map(purchase => {
            return {
              id: purchase.user_id,
              email: purchase.email || '',
              purchase_id: purchase.id
            };
          });

          setCustomers(formattedCustomers);
          setFilteredCustomers(formattedCustomers);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers");
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Set up automatic notifications check
  useEffect(() => {
    const checkPendingDeliveries = async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const { data: pendingDeliveries, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('expected_delivery_date', tomorrowStr)
          .eq('type', 'tracking_update');

        if (error) {
          console.error('Error checking pending deliveries:', error);
          return;
        }

        // Send reminder notifications for deliveries due tomorrow
        if (pendingDeliveries && pendingDeliveries.length > 0) {
          for (const delivery of pendingDeliveries) {
            await supabase.from('notifications').insert([
              {
                user_id: delivery.user_id,
                message: `Your order is expected to arrive tomorrow! Tracking: ${delivery.tracking_number}`,
                tracking_number: delivery.tracking_number,
                type: 'delivery_reminder',
                purchase_id: delivery.purchase_id
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error checking delivery reminders:', error);
      }
    };

    // Check for pending deliveries every hour
    const interval = setInterval(checkPendingDeliveries, 60 * 60 * 1000);
    checkPendingDeliveries(); // Run immediately

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredCustomers(customers);
      setShowDropdown(false);
      return;
    }
    
    const filtered = customers.filter(
      customer => customer.email.toLowerCase().includes(value)
    );
    
    setFilteredCustomers(filtered);
    setShowDropdown(true);
  };

  const handleSelectCustomer = (customer: CustomerData) => {
    setSelectedCustomerId(customer.id);
    setSearchTerm(customer.email);
    setPurchaseId(customer.purchase_id);
    setShowDropdown(false);
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

    if (!expectedDeliveryDate) {
      toast.error("Please enter expected delivery date");
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
          purchase_id: purchaseId,
          expected_delivery_date: expectedDeliveryDate
        },
      ]);

      if (error) throw error;

      // Also update the purchase status to 'delivering'
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'delivering' })
        .eq('id', purchaseId);

      if (updateError) throw updateError;

      toast.success("Tracking notification sent successfully!");
      setMessage("");
      setTrackingNumber("");
      setExpectedDeliveryDate("");
      setSearchTerm("");
      setSelectedCustomerId("");
      setPurchaseId("");
      
      // Remove the shipped order from the list
      setCustomers(prev => prev.filter(customer => customer.purchase_id !== purchaseId));
      setFilteredCustomers(prev => prev.filter(customer => customer.purchase_id !== purchaseId));
      
      // Show alert
      alert("Notification has been successfully sent to the customer!");
      
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <p className="text-sm text-gray-500">Update customers on their order shipment status with delivery expectations</p>
          </div>
        </div>

        <div>
          <Label className="text-[#8B7355] flex items-center gap-2 mb-2">
            <Search className="w-4 h-4" />
            Search Customer Email
          </Label>
          <div className="relative">
            <Input
              placeholder="Search by email"
              value={searchTerm}
              onChange={handleSearch}
              className="mb-2"
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && searchTerm && filteredCustomers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id + customer.purchase_id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div>
                      <div className="font-medium">{customer.email}</div>
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
                No customers found with that email
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
  );
}
