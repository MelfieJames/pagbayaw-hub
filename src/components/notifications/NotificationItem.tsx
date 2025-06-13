
import { format } from "date-fns";
import { Copy, Eye, Star, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Notification } from "./types";
import { NotificationIcon, getNotificationColor } from "./NotificationIcon";

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  onViewDetails: (notification: Notification) => void;
}

export function NotificationItem({ 
  notification, 
  onNotificationClick, 
  onViewDetails 
}: NotificationItemProps) {
  const navigate = useNavigate();

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success("Tracking number copied to clipboard!");
  };

  const handleReviewProduct = (productId?: number) => {
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }
    
    navigate(`/products?productId=${productId}&openReview=true`);
  };

  return (
    <div 
      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        {notification.type === 'tracking_update' ? (
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
            alt="JNT Express" 
            className="h-10 w-10 rounded-full object-contain border border-slate-200 p-1 bg-white"
          />
        ) : (
          <div className={`${getNotificationColor(notification.type)} p-2 rounded-full text-white flex-shrink-0`}>
            <NotificationIcon type={notification.type} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-slate-700 ${!notification.is_read ? 'font-semibold' : 'font-normal'}`}>
            {notification.message}
          </p>
          <div className="text-xs text-slate-500 mt-1">
            {format(new Date(notification.created_at), "MMM d, yyyy • h:mm a")}
          </div>

          {notification.expected_delivery_date && (
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md w-fit">
              <Calendar className="h-3 w-3" />
              Expected: {format(new Date(notification.expected_delivery_date), "MMM d, yyyy")}
            </div>
          )}
          
          {notification.tracking_number && (
            <div className="flex items-center gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  copyTrackingNumber(notification.tracking_number!);
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Tracking
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(notification);
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                See Details
              </Button>
            </div>
          )}

          {notification.type === 'review_request' && notification.product_id && (
            <div className="mt-3">
              <Button 
                size="sm"
                variant="outline"
                className="h-7 text-xs bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReviewProduct(notification.product_id);
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                Leave Review
              </Button>
            </div>
          )}
        </div>
        
        {!notification.tracking_number && notification.type !== 'review_request' && (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(notification);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
