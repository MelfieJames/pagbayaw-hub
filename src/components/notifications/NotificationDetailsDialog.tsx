
import { format } from "date-fns";
import { Copy, Star, Calendar } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Notification, PurchaseDetails } from "./types";
import { NotificationIcon, getNotificationColor } from "./NotificationIcon";

interface NotificationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNotification: Notification | null;
  purchaseDetails: PurchaseDetails | null;
}

export function NotificationDetailsDialog({
  open,
  onOpenChange,
  selectedNotification,
  purchaseDetails
}: NotificationDetailsDialogProps) {
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] border-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            {selectedNotification?.type === 'tracking_update' ? (
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                alt="JNT Express" 
                className="h-6 w-6 rounded-full object-contain border border-slate-200"
              />
            ) : (
              <div className={`${getNotificationColor(selectedNotification?.type || '')} p-1 rounded-full text-white`}>
                <NotificationIcon type={selectedNotification?.type || ''} className="h-4 w-4" />
              </div>
            )}
            {selectedNotification?.type === 'tracking_update' ? 'Tracking Update' : 
             selectedNotification?.type === 'review_request' ? 'Review Request' : 'Notification Details'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {selectedNotification && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="mb-3 font-medium text-slate-800">{selectedNotification.message}</div>
                <div className="text-xs text-slate-500">
                  {format(new Date(selectedNotification.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </div>
                
                {selectedNotification.expected_delivery_date && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md w-fit">
                    <Calendar className="h-4 w-4" />
                    Expected Delivery: {format(new Date(selectedNotification.expected_delivery_date), "MMMM d, yyyy")}
                  </div>
                )}
              </div>
              
              {selectedNotification.tracking_number && (
                <div className="p-4 border border-slate-200 rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-slate-800">Tracking Information</div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyTrackingNumber(selectedNotification.tracking_number!)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Number
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                      alt="JNT Express" 
                      className="h-12 w-12 rounded-full object-contain border border-slate-200 p-1 bg-white"
                    />
                    <div>
                      <div className="font-medium text-slate-800">J&T Express</div>
                      <div className="text-sm font-mono bg-slate-100 p-2 rounded mt-1 border border-slate-200">
                        {selectedNotification.tracking_number}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-sm text-slate-600">
                    You can track your package by visiting the J&T Express website and entering this tracking number.
                  </div>
                </div>
              )}

              {selectedNotification.type === 'review_request' && selectedNotification.product_id && (
                <div className="text-center">
                  <Button
                    onClick={() => handleReviewProduct(selectedNotification.product_id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </div>
              )}
              
              {selectedNotification.purchase_id && purchaseDetails && (
                <div className="p-4 border border-slate-200 rounded-lg bg-white">
                  <div className="font-medium mb-3 text-slate-800">Order Details</div>
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Order Number:</span>
                      <span className="text-slate-800">#{purchaseDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Total Amount:</span>
                      <span className="text-slate-800 font-semibold">₱{purchaseDetails.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-600">Order Date:</span>
                      <span className="text-slate-800">{format(new Date(purchaseDetails.created_at), "MMM d, yyyy")}</span>
                    </div>
                    
                    {purchaseDetails.purchase_items && purchaseDetails.purchase_items.length > 0 && (
                      <div className="mt-4">
                        <div className="font-medium text-slate-600 mb-2">Items Ordered ({purchaseDetails.purchase_items.length}):</div>
                        <div className="space-y-2">
                          {purchaseDetails.purchase_items.map((item, index) => (
                            <div key={index} className="text-xs bg-slate-50 p-3 rounded border border-slate-100">
                              <div className="font-medium text-slate-800">{item.products.product_name}</div>
                              <div className="text-slate-600 mt-1">Quantity: {item.quantity}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
