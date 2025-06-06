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
  status: string;
  created_at: string;
  purchase_items: {
    product: {
      product_name: string;
    };
    quantity: number;
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
          status,
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
      return data as PurchaseDetails;
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
        return 'bg-blue-500';
      case 'system':
        return 'bg-purple-500';
      case 'inventory':
        return 'bg-amber-500';
      case 'alert':
        return 'bg-red-500';
      case 'tracking_update':
        return 'bg-[#C4A484]';
      case 'review_request':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[350px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <Bell className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center gap-3">
                      {notification.type === 'tracking_update' ? (
                        <img 
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                          alt="JNT Express" 
                          className="h-10 w-10 rounded-full object-contain border p-1"
                        />
                      ) : (
                        <div className={`${getNotificationColor(notification.type)} p-2 rounded-full text-white`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                          {notification.message}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(notification.created_at), "MMM d, yyyy • h:mm a")}
                        </div>

                        {/* Show expected delivery date */}
                        {notification.expected_delivery_date && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            Expected: {format(new Date(notification.expected_delivery_date), "MMM d, yyyy")}
                          </div>
                        )}
                        
                        {notification.tracking_number && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs"
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
                              className="h-7 text-xs bg-[#F5F5DC] border-[#C4A484] text-[#8B7355] hover:bg-[#C4A484] hover:text-white"
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
                          <div className="mt-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200"
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
                          className="h-6 w-6"
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
          
          <div className="p-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Notification Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification?.type === 'tracking_update' ? (
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                  alt="JNT Express" 
                  className="h-6 w-6 rounded-full object-contain"
                />
              ) : (
                getNotificationIcon(selectedNotification?.type || '')
              )}
              {selectedNotification?.type === 'tracking_update' ? 'Tracking Update' : 
               selectedNotification?.type === 'review_request' ? 'Review Request' : 'Notification'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="mb-3 font-medium">{selectedNotification.message}</div>
                <div className="text-xs text-gray-500">
                  {format(new Date(selectedNotification.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </div>
                
                {/* Show expected delivery date in details */}
                {selectedNotification.expected_delivery_date && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <Calendar className="h-4 w-4" />
                    Expected Delivery: {format(new Date(selectedNotification.expected_delivery_date), "MMMM d, yyyy")}
                  </div>
                )}
              </div>
              
              {selectedNotification.tracking_number && (
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Tracking Information</div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyTrackingNumber(selectedNotification.tracking_number!)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Number
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                      alt="JNT Express" 
                      className="h-12 w-12 rounded-full object-contain border p-1"
                    />
                    <div>
                      <div className="font-medium">J&T Express</div>
                      <div className="text-sm font-mono bg-gray-100 p-1 rounded mt-1">
                        {selectedNotification.tracking_number}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-sm text-gray-500">
                    You can track your package by visiting the J&T Express website and entering this tracking number.
                  </div>
                </div>
              )}

              {selectedNotification.type === 'review_request' && selectedNotification.product_id && (
                <div className="text-center">
                  <Button
                    onClick={() => handleReviewProduct(selectedNotification.product_id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </div>
              )}
              
              {/* Show detailed order information */}
              {selectedNotification.purchase_id && purchaseDetails && (
                <div className="p-4 border rounded-md">
                  <div className="font-medium mb-2">Order Details</div>
                  <div className="text-sm space-y-2">
                    <div><strong>Order #:</strong> {purchaseDetails.id}</div>
                    <div><strong>Total Amount:</strong> ₱{purchaseDetails.total_amount}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        purchaseDetails.status === 'completed' ? 'bg-green-100 text-green-800' :
                        purchaseDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {purchaseDetails.status}
                      </span>
                    </div>
                    <div><strong>Order Date:</strong> {format(new Date(purchaseDetails.created_at), "MMM d, yyyy")}</div>
                    
                    {purchaseDetails.purchase_items && purchaseDetails.purchase_items.length > 0 && (
                      <div className="mt-3">
                        <strong>Items:</strong>
                        <ul className="mt-1 space-y-1">
                          {purchaseDetails.purchase_items.map((item, index) => (
                            <li key={index} className="text-xs bg-gray-50 p-2 rounded">
                              {item.product?.product_name} (Qty: {item.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
