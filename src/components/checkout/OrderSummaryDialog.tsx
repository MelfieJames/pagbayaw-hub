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
  purok: string | null;
  barangay: string;
}

interface OrderSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: number | null;
  userEmail: string | undefined;
  cartItems: CartItem[];
  total: number;
  onDetailsSubmitted: () => void;
  readOnly?: boolean;
  selectedAddress?: any;
}

export default function OrderSummaryDialog({
  open,
  onOpenChange,
  purchaseId,
  userEmail,
  cartItems,
  total,
  onDetailsSubmitted,
  readOnly = false,
  selectedAddress,
}: OrderSummaryDialogProps) {
  const [step, setStep] = useState<"summary" | "details">("summary");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("saved");
  const [selectedAddressState, setSelectedAddress] = useState<AddressData | null>(null);

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-green-600">
            <Check className="h-6 w-6" />
            Confirm Your Order
          </DialogTitle>
          <DialogDescription>
            Please review your order details below. All information is read-only. Click Confirm to place your order.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Products List */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Products</h3>
            <div className="divide-y border rounded-lg bg-white">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex items-center gap-4 p-3">
                  <img
                    src={item.products?.image || "/placeholder.svg"}
                    alt={item.products?.product_name}
                    className="w-14 h-14 object-cover rounded-md border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.products?.product_name}</div>
                    <div className="text-xs text-gray-500">Unit Price: ₱{item.products?.product_price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-green-700">
                    ₱{(item.quantity * (item.products?.product_price || 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Delivery Information</h3>
            <div className="border rounded-lg bg-white p-3 text-sm text-gray-700">
              <div><span className="font-medium">Recipient:</span> {selectedAddress?.recipient_name || 'Not provided'}</div>
              <div><span className="font-medium">Address:</span> {selectedAddress ? `${selectedAddress.address_line1 || ''}${selectedAddress.address_line2 ? ', ' + selectedAddress.address_line2 : ''}${selectedAddress.purok ? ', Purok ' + selectedAddress.purok : ''}, ${selectedAddress.barangay || ''}, ${selectedAddress.city || ''}, ${selectedAddress.state_province || ''} ${selectedAddress.postal_code || ''}, ${selectedAddress.country || ''}` : 'Not provided'}</div>
              <div><span className="font-medium">Phone:</span> {selectedAddress?.phone_number || 'Not provided'}</div>
              <div><span className="font-medium">Email:</span> {userEmail}</div>
            </div>
            <h3 className="font-semibold mt-4 mb-2">Payment Info</h3>
            <div className="border rounded-lg bg-white p-3 text-sm text-gray-700">
              <div>Cash on Delivery (COD)</div>
              <div className="text-xs text-gray-500 mt-1">Pay in cash when your order is delivered. No advance payment required.</div>
            </div>
            <div className="mt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center mt-6">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
            onClick={onDetailsSubmitted}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
