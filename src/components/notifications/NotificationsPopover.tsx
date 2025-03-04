import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ErrorModal from "@/components/ErrorModal";
export function NotificationsPopover() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [reviewProduct, setReviewProduct] = useState<{
    id: number;
    name: string;
    purchaseId: number;
    image: string | null;
  } | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    message: ""
  });
  const queryClient = useQueryClient();
  const {
    data: notifications = [],
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const {
          data: notificationData,
          error: notificationError
        } = await supabase.from('notifications').select('*, purchases(*)').eq('user_id', user.id).order('created_at', {
          ascending: false
        });
        if (notificationError) {
          console.error('Notifications fetch error:', notificationError);
          return [];
        }
        const notificationsWithProducts = await Promise.all(notificationData.map(async notification => {
          if (notification.type === 'review_request') {
            const {
              data: purchaseItems,
              error: purchaseItemsError
            } = await supabase.from('purchase_items').select('*, products(*)').eq('purchase_id', notification.purchase_id);
            if (purchaseItemsError) {
              console.error('Purchase items fetch error:', purchaseItemsError);
              return notification;
            }
            return {
              ...notification,
              products: purchaseItems
            };
          }
          return notification;
        }));
        return notificationsWithProducts;
      } catch (error) {
        console.error('Unexpected error fetching notifications:', error);
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Get user's existing reviews to check if they've already reviewed products
  const {
    data: userReviews = []
  } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const {
          data,
          error
        } = await supabase.from('reviews').select('product_id, purchase_item_id').eq('user_id', user.id);
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        return [];
      }
    },
    enabled: !!user
  });
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const markAsRead = async (notificationId: number) => {
    if (!user?.id) return;
    try {
      await supabase.from('notifications').update({
        is_read: true
      }).eq('id', notificationId);

      // Refetch notifications to update the unread count
      refetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  const handleNotificationClick = async (notification: any) => {
    // Mark notification as read when clicked
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.type === 'review_request' && notification.products?.length > 0) {
      const firstProduct = notification.products[0];

      // Check if user has already reviewed this product
      const hasReviewed = userReviews.some(review => review.product_id === firstProduct.product_id && review.purchase_item_id === notification.purchase_id);
      if (hasReviewed) {
        setErrorMessage({
          title: "Already Reviewed",
          message: "You have already reviewed this product. You can only review a product once."
        });
        setErrorModalOpen(true);
        return;
      }
      setReviewProduct({
        id: firstProduct.product_id,
        name: firstProduct.products?.product_name || 'Product',
        purchaseId: notification.purchase_id,
        image: firstProduct.products?.image || null
      });
    }
  };
  const navigateToMyRatings = () => {
    navigate('/my-ratings');
  };
  const handleSubmitReview = async () => {
    if (!user?.id || !reviewProduct || rating === 0) {
      toast("Please select a rating before submitting");
      return;
    }
    try {
      setIsSubmitting(true);

      // Check one more time if user has already reviewed this product
      const hasReviewed = userReviews.some(review => review.product_id === reviewProduct.id && review.purchase_item_id === reviewProduct.purchaseId);
      if (hasReviewed) {
        setErrorMessage({
          title: "Already Reviewed",
          message: "You have already reviewed this product. You can only review a product once."
        });
        setErrorModalOpen(true);
        setReviewProduct(null);
        setRating(0);
        setComment("");
        return;
      }
      const {
        error
      } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: reviewProduct.id,
        rating,
        comment,
        purchase_item_id: reviewProduct.purchaseId
      });
      if (error) {
        console.error("Error submitting review:", error);
        if (error.code === '23505') {
          setErrorMessage({
            title: "Already Reviewed",
            message: "You have already reviewed this product. You can only review a product once."
          });
          setErrorModalOpen(true);
        } else {
          toast("Failed to submit review: " + error.message);
        }
        return;
      }
      toast("Review submitted successfully!");
      queryClient.invalidateQueries({
        queryKey: ['product-reviews']
      });
      queryClient.invalidateQueries({
        queryKey: ['all-reviews']
      });
      queryClient.invalidateQueries({
        queryKey: ['my-reviews', user.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['user-reviews', user.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['notifications', user.id]
      });
      setReviewProduct(null);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error('Error submitting review:', error);
      toast("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative mx-[20px]">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Notifications</h4>
            {user && <Button variant="ghost" size="sm" onClick={navigateToMyRatings}>
                My Ratings
              </Button>}
          </div>
          <ScrollArea className="h-[300px]">
            {!user ? <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Please log in to view your notifications
                </p>
                <Button className="w-full" onClick={() => navigate('/login')}>
                  Log In
                </Button>
              </div> : notifications.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">
                No notifications yet
              </p> : <div className="space-y-2">
                {notifications.map(notification => {
              const isReviewRequest = notification.type === 'review_request';
              let productDetails = null;
              if (isReviewRequest && notification.products?.length > 0) {
                productDetails = notification.products[0].products;
              }
              return <div key={notification.id} className={`p-3 rounded-lg border ${!notification.is_read ? 'bg-muted/50' : ''}`} role="button" tabIndex={0} onClick={() => handleNotificationClick(notification)} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNotificationClick(notification);
                }
              }}>
                      <div className="flex gap-3">
                        {productDetails?.image && <img src={productDetails.image} alt={productDetails.product_name} className="w-12 h-12 object-cover rounded-md" />}
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <div className="flex justify-between items-center mt-2">
                            {isReviewRequest ? <Button size="sm" variant="outline" onClick={e => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}>
                                Rate Now
                              </Button> : <Badge variant="outline">
                                {notification.purchases?.status || 'Notification'}
                              </Badge>}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notification.created_at), 'PP')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>;
            })}
              </div>}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Dialog open={!!reviewProduct} onOpenChange={() => setReviewProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate & Review {reviewProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reviewProduct?.image && <div className="flex justify-center">
                <img src={reviewProduct.image} alt={reviewProduct.name} className="w-32 h-32 object-cover rounded-md" />
              </div>}
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setRating(star)} className={`p-2 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}>
                  <Star className="h-8 w-8" fill={rating >= star ? "currentColor" : "none"} />
                </button>)}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
            <Textarea placeholder="Share your experience with this product..." value={comment} onChange={e => setComment(e.target.value)} className="min-h-[100px]" />
            <Button onClick={handleSubmitReview} disabled={rating === 0 || isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <ErrorModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} title={errorMessage.title} message={errorMessage.message} />
    </>;
}