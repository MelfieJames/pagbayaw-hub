
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, User, MapPin, Phone, ShoppingBag } from "lucide-react";
import { ProfileData } from "@/hooks/useProfile";
import { CartItem } from "@/types/product";

interface OrderSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: number | null;
  profileData: ProfileData;
  cartItems: CartItem[];
  total: number;
}

export default function OrderSummaryDialog({
  open,
  onOpenChange,
  purchaseId,
  profileData,
  cartItems,
  total
}: OrderSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-green-600">
            <Check className="h-6 w-6" />
            Order Completed!
          </DialogTitle>
          <DialogDescription>
            Your order has been successfully processed and will be shipped soon.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Order Number:</span>
            <span className="font-bold">#{purchaseId}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Completed</span>
          </div>
        </div>

        {profileData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
            <h3 className="font-medium mb-2">Shipping Information</h3>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{profileData.first_name} {profileData.last_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{profileData.phone_number}</span>
              </div>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h3 className="font-medium flex items-center gap-1">
              <ShoppingBag className="h-4 w-4 text-gray-500" />
              Order Items
            </h3>
          </div>
          <div className="p-3">
            {cartItems.map((item) => (
              <div 
                key={item.product_id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <img
                  src={item.products?.image || "/placeholder.svg"}
                  alt={item.products?.product_name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.products?.product_name}</div>
                  <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-medium text-sm">₱{(item.products?.product_price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
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
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
