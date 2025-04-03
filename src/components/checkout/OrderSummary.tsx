
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CreditCard, ArrowRight } from "lucide-react";

interface OrderSummaryProps {
  total: number;
  isComplete: boolean;
  cartItems: any[];
  isProcessing: boolean;
  handleCheckout: () => void;
}

export default function OrderSummary({
  total,
  isComplete,
  cartItems,
  isProcessing,
  handleCheckout
}: OrderSummaryProps) {
  return (
    <div className="border rounded-lg p-6 sticky top-24 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" /> Order Summary
      </h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="pt-2">
        <div className="flex justify-between font-semibold mb-6 text-lg">
          <span>Total</span>
          <span className="text-primary">₱{total.toFixed(2)}</span>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
          disabled={!isComplete || cartItems.length === 0 || isProcessing}
          onClick={handleCheckout}
        >
          {isProcessing ? (
            <>
              <LoadingSpinner size="sm" /> Processing...
            </>
          ) : (
            <>
              Complete Order <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        
        {!isComplete && (
          <p className="text-amber-600 text-xs mt-2 text-center">
            Please complete your profile before checkout
          </p>
        )}
      </div>
    </div>
  );
}
