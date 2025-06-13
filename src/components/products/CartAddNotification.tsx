
import { CheckCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface CartAddNotificationProps {
  productName: string;
}

export const showCartAddNotification = (productName: string) => {
  toast.success(
    <div className="flex items-center gap-2 animate-scale-in">
      <div className="relative animate-bounce">
        <ShoppingCart className="h-5 w-5 text-green-600" />
        <CheckCircle className="h-3 w-3 text-green-600 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div>
        <p className="font-medium text-sm">Added to cart!</p>
        <p className="text-xs text-muted-foreground">{productName}</p>
      </div>
    </div>,
    {
      duration: 3000,
      className: "border-green-200 bg-green-50 animate-fade-in scale-in",
    }
  );
};
