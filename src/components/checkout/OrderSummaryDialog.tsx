import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, ShoppingBag } from "lucide-react";
import { CartItem } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import AddressManagement from "./AddressManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
}

interface AddressData {
  id: number;
  address_name: string;
  recipient_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  created_at: string;
}

interface OrderSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: number | null;
  userEmail: string | undefined;
  cartItems: CartItem[];
  total: number;
  onDetailsSubmitted: () => void;
}

export default function OrderSummaryDialog({
  open,
  onOpenChange,
  purchaseId,
  userEmail,
  cartItems,
  total,
  onDetailsSubmitted,
}: OrderSummaryDialogProps) {
  const [step, setStep] = useState<"summary" | "details">("summary");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("saved");
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails>({
    first_name: "",
    last_name: "",
    email: userEmail || "", 
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!purchaseId && !userEmail) {
        toast.error("No purchase or email available.");
        return;
      }

      try {
        const email = userEmail || (purchaseId && await fetchPurchaseEmail(purchaseId));
        
        if (!email) {
          toast.error("No email found for the purchase.");
          return;
        }

        const { data, error } = await supabase
          .from("transaction_details")
          .select("*")
          .eq("email", email)
          .single();

        if (error || !data) {
          setStep("details");
        } else {
          setTransactionDetails({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
            address: data.address,
          });
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        toast.error("Failed to load transaction details.");
      }
    };

    if (open) {
      fetchTransactionDetails();
    }
  }, [purchaseId, userEmail, open]);

  const fetchPurchaseEmail = async (purchaseId: number) => {
    const { data, error } = await supabase
      .from("purchases")
      .select("email")
      .eq("id", purchaseId)
      .single();

    if (error || !data) {
      toast.error("No email found for the purchase.");
      return null;
    }
    return data.email;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransactionDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitDetails = async () => {
    // Validate inputs
    if (activeTab === "new") {
      for (const [key, value] of Object.entries(transactionDetails)) {
        if (!value.trim()) {
          toast.error(`Please fill in your ${key.replace("_", " ")}`);
          return;
        }
      }
    } else if (activeTab === "saved" && !selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    setIsSubmitting(true);

    try {
      // If a saved address was selected, use that data
      if (selectedAddress) {
        const addressLine2 = selectedAddress.address_line2 ? `${selectedAddress.address_line2}, ` : '';
        const purokPart = selectedAddress.purok ? `Purok ${selectedAddress.purok}, ` : '';
        const formattedAddress = `${selectedAddress.address_line1}, ${addressLine2}${purokPart}${selectedAddress.barangay}, ${selectedAddress.city}, ${selectedAddress.state_province}, ${selectedAddress.postal_code}, ${selectedAddress.country}`;
        
        const { error: updateError } = await supabase.from("transaction_details").upsert(
          {
            first_name: selectedAddress.recipient_name.split(' ')[0] || transactionDetails.first_name,
            last_name: selectedAddress.recipient_name.split(' ').slice(1).join(' ') || transactionDetails.last_name,
            email: transactionDetails.email,
            phone_number: selectedAddress.phone_number,
            address: formattedAddress,
            purchase_id: purchaseId
          },
          { onConflict: "email" }
        );

        if (updateError) throw updateError;

        // Update the purchase with the selected address ID
        const { error: purchaseUpdateError } = await supabase
          .from("purchases")
          .update({ user_address_id: selectedAddress.id })
          .eq("id", purchaseId);

        if (purchaseUpdateError) throw purchaseUpdateError;
      } else {
        // Use manual input
        const { error } = await supabase.from("transaction_details").upsert(
          {
            ...transactionDetails,
            purchase_id: purchaseId
          },
          { onConflict: "email" }
        );

        if (error) throw error;
      }

      toast.success("Shipping details saved successfully!");
      onDetailsSubmitted();
      onOpenChange(false);
    } catch (err) {
      console.error("Error submitting details:", err);
      toast.error("Failed to save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSelect = (address: AddressData) => {
    setSelectedAddress(address);
  };

  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        {step === "summary" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2 text-green-600">
                <Check className="h-6 w-6" />
                Order Completed!
              </DialogTitle>
              <DialogDescription>
                Your order has been successfully processed. Proceed to shipping details to complete your order.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order Number:</span>
                <span className="font-bold">#{purchaseId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Completed</span>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h3 className="font-medium flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4 text-gray-500" />
                  Order Items
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 border-b last:border-0 py-2">
                    <img
                      src={item.products?.image || "/placeholder.svg"}
                      alt={item.products?.product_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.products?.product_name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium text-sm">
                      ₱{(item.products?.product_price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button className="w-full" onClick={() => setStep("details")}>
                Continue to Shipping Details
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Shipping Details</DialogTitle>
              <DialogDescription>
                Please provide your shipping information to complete your order #{purchaseId}.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="saved" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="saved">Saved Addresses</TabsTrigger>
                <TabsTrigger value="new">Enter Address</TabsTrigger>
              </TabsList>
              
              <TabsContent value="saved" className="space-y-4 py-4">
                <AddressManagement 
                  onAddressSelect={handleAddressSelect} 
                  selectedAddress={selectedAddress}
                  showSelectionUI={true} 
                />
              </TabsContent>
              
              <TabsContent value="new" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={transactionDetails.first_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={transactionDetails.last_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={transactionDetails.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={transactionDetails.phone_number}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={transactionDetails.address}
                    onChange={handleInputChange}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button 
                onClick={() => setStep("summary")} 
                variant="outline" 
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button onClick={handleSubmitDetails} className="w-full md:w-auto" disabled={isSubmitting || (activeTab === "saved" && !selectedAddress)}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    &nbsp;Submitting...
                  </>
                ) : (
                  "Submit Details"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
