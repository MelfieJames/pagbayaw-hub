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

interface TransactionDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
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

  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails>({
    first_name: "",
    last_name: "",
    email: userEmail || "", // Ensure email is passed correctly
    phone_number: "",
    address: "",
  });

  // Fetch transaction details using purchaseId or userEmail if no purchaseId is available
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

    fetchTransactionDetails();
  }, [purchaseId, userEmail]);

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
    for (const [key, value] of Object.entries(transactionDetails)) {
      if (!value.trim()) {
        toast.error(`Please fill in your ${key.replace("_", " ")}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("transaction_details").upsert(
        {
          ...transactionDetails,
        },
        { onConflict: "email" }
      );

      if (error) throw error;

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
              <DialogTitle className="text-xl">Your Shipping Details</DialogTitle>
              <DialogDescription>
                Please provide your shipping information to complete your order #{purchaseId}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
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
            </div>

            <DialogFooter>
              <Button onClick={handleSubmitDetails} className="w-full" disabled={isSubmitting}>
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
