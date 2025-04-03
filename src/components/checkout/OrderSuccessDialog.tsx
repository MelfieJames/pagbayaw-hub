
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface OrderSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigateToOrders: () => void;
  navigateToProducts: () => void;
}

export default function OrderSuccessDialog({
  open,
  onOpenChange,
  navigateToOrders,
  navigateToProducts
}: OrderSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-6 w-6" />
            Order Successful!
          </DialogTitle>
          <DialogDescription>
            Your order has been successfully processed. Please check your notifications to rate your purchases.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={navigateToOrders}
          >
            View My Orders
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={navigateToProducts}
          >
            Continue Shopping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
