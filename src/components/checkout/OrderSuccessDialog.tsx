
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface OrderSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigateToProducts: () => void;
}

export default function OrderSuccessDialog({
  open,
  onOpenChange,
  navigateToProducts,
}: OrderSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center my-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-semibold">Order Successful!</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <p className="text-gray-600 mt-2">
            You will receive a confirmation email shortly.
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={navigateToProducts}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Continue Shopping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
