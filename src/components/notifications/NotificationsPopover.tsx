import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, CheckCircle, AlertTriangle, Package, ChevronRight, Copy, Eye, Star, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  message: string;
  created_at: string;
  type: string;
  is_read: boolean;
  purchase_id: number | null;
  tracking_number: string | null;
  expected_delivery_date: string | null;
  product_id?: number;
}

interface PurchaseDetails {
  id: number;
  total_amount: number;
  created_at: string;
  purchase_items: {
    quantity: number;
    product: {
      product_name: string;
    };
  }[];
}

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  const { data: purchaseDetails } = useQuery({
    queryKey: ['purchase-details', selectedNotification?.purchase_id],
    queryFn: async () => {
      if (!selectedNotification?.purchase_id) return null;
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          total_amount,
          created_at,
          purchase_items (
            quantity,
            product:products (
              product_name
            )
          )
        `)
        .eq('id', selectedNotification.purchase_id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedNotification?.purchase_id,
  });
  
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notification-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count', user?.id] });
    },
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count', user?.id] });
    },
  });
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailsOpen(true);
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };
  
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
    setDetailsOpen(false);
    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
        return <CheckCircle className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      case 'tracking_update':
        return <Package className="h-5 w-5" />;
      case 'review_request':
        return <Star className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  const getNotificationColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
        return 'bg-blue-600';
      case 'system':
        return 'bg-slate-600';
      case 'inventory':
        return 'bg-amber-600';
      case 'alert':
        return 'bg-red-600';
      case 'tracking_update':
        return 'bg-slate-700';
      case 'review_request':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-600 text-white font-medium">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0 border-slate-200" align="end">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <Bell className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-slate-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                    onClick={() => handleNotificationClick(notification)}
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
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-slate-700 ${!notification.is_read ? 'font-semibold' : 'font-normal'}`}>
                          {notification.message}
                        </p>
                        <div className="text-xs text-slate-500 mt-1">
                          {format(new Date(notification.created_at), "MMM d, yyyy • h:mm a")}
                        </div>

                        {/* Show expected delivery date */}
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
                                viewNotificationDetails(notification);
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
                            viewNotificationDetails(notification);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Notification Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
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
                  {getNotificationIcon(selectedNotification?.type || '')}
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
                  
                  {/* Show expected delivery date in details */}
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
                
                {/* Show detailed order information */}
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
                          <div className="font-medium text-slate-600 mb-2">Items Ordered:</div>
                          <div className="space-y-2">
                            {purchaseDetails.purchase_items.map((item, index) => (
                              <div key={index} className="text-xs bg-slate-50 p-3 rounded border border-slate-100">
                                <div className="font-medium text-slate-800">{item.product?.product_name}</div>
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

          <DialogFooter className="border-t border-slate-200 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDetailsOpen(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
