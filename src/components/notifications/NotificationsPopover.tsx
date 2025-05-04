
import { useState, useRef, useEffect } from "react";
import { Bell, Copy, Star, Image, Video, ExternalLink, Package, ShoppingBag, AlertTriangle } from "lucide-react";
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
import { Star as StarIcon, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ErrorModal from "@/components/ErrorModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NotificationsPopover() {
  const { user } = useAuth();
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
  const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  // Media upload state
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewVideo, setReviewVideo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();
  
  // Rest of existing code for fetching notifications
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
    
    if (notification.type === 'tracking_update') {
      setSelectedNotification(notification);
      setNotificationDetailsOpen(true);
      return;
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
  
  const copyTrackingNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Tracking number copied to clipboard");
  };
  
  const navigateToMyRatings = () => {
    navigate('/my-ratings');
  };
  
  // Function to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'tracking_update':
        return <Package className="h-5 w-5 text-[#C4A484]" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewVideo(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewVideo(objectUrl);
    }
  };

  const resetMediaFiles = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo);
    }
    setReviewImage(null);
    setReviewVideo(null);
    setPreviewImage(null);
    setPreviewVideo(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };
  
  const uploadMedia = async () => {
    let imageUrl = null;
    let videoUrl = null;

    if (reviewImage) {
      const fileExt = reviewImage.name.split('.').pop();
      const filePath = `reviews/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, reviewImage);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Error uploading image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    if (reviewVideo) {
      const fileExt = reviewVideo.name.split('.').pop();
      const filePath = `reviews/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, reviewVideo);

      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        throw new Error('Error uploading video');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      videoUrl = publicUrl;
    }

    return { imageUrl, videoUrl };
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
        resetMediaFiles();
        return;
      }
      
      // Upload media files if any
      const { imageUrl, videoUrl } = await uploadMedia();
      
      const {
        error
      } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: reviewProduct.id,
        rating,
        comment,
        purchase_item_id: reviewProduct.purchaseId,
        image_url: imageUrl,
        video_url: videoUrl
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
      resetMediaFiles();
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
          <Button variant="ghost" size="icon" className="relative mx-[5px]">
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
              const isTrackingUpdate = notification.type === 'tracking_update';
              let productDetails = null;
              let trackingNumber = null;
              
              if (isReviewRequest && notification.products?.length > 0) {
                productDetails = notification.products[0].products;
              }
              
              if (isTrackingUpdate) {
                // Extract tracking number from the message using regex
                const trackingRegex = /TRACKING NUMBER:\s*([A-Za-z0-9]+)/;
                const match = notification.message.match(trackingRegex);
                if (match && match[1]) {
                  trackingNumber = match[1];
                }
              }
              
              return <div key={notification.id} className={`p-3 rounded-lg border ${!notification.is_read ? 'bg-muted/50' : ''}`} role="button" tabIndex={0} onClick={() => handleNotificationClick(notification)} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNotificationClick(notification);
                }
              }}>
                      <div className="flex gap-3">
                        {isTrackingUpdate ? (
                          <img 
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                            alt="JNT Express" 
                            className="w-12 h-12 object-cover rounded-md border" 
                          />
                        ) : productDetails?.image ? (
                          <img 
                            src={productDetails.image} 
                            alt={productDetails.product_name} 
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gray-100">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          
                          <div className="flex justify-between items-center mt-2">
                            {isReviewRequest ? (
                              <Button size="sm" variant="outline" onClick={e => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}>
                                Rate Now
                              </Button>
                            ) : isTrackingUpdate && trackingNumber ? (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex items-center gap-1 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyTrackingNumber(trackingNumber);
                                  }}
                                >
                                  <Copy className="h-3 w-3" /> Copy
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex items-center gap-1 text-xs bg-[#C4A484] hover:bg-[#8B7355]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNotification(notification);
                                    setNotificationDetailsOpen(true);
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3" /> See All
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                {notification.purchases?.status || 'Notification'}
                              </Badge>
                            )}
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

      {/* Review Dialog */}
      <Dialog open={!!reviewProduct} onOpenChange={() => {
        setReviewProduct(null);
        resetMediaFiles();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate & Review {reviewProduct?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
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
              
              {/* Media Upload Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="review-image">Add Image (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={imageInputRef}
                      id="review-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {previewImage && (
                    <div className="mt-2">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-32 object-cover rounded-md"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-red-500"
                        onClick={() => {
                          URL.revokeObjectURL(previewImage);
                          setPreviewImage(null);
                          setReviewImage(null);
                          if (imageInputRef.current) imageInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-video">Add Video (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={videoInputRef}
                      id="review-video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <VideoIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {previewVideo && (
                    <div className="mt-2">
                      <video
                        src={previewVideo}
                        controls
                        className="h-32 w-full rounded-md"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-red-500"
                        onClick={() => {
                          URL.revokeObjectURL(previewVideo);
                          setPreviewVideo(null);
                          setReviewVideo(null);
                          if (videoInputRef.current) videoInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <Button onClick={handleSubmitReview} disabled={rating === 0 || isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Tracking Details Dialog */}
      <Dialog open={notificationDetailsOpen} onOpenChange={setNotificationDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#C4A484]" />
              Tracking Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            {selectedNotification && (
              <>
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                    alt="JNT Express" 
                    className="w-16 h-16 object-cover rounded-md border" 
                  />
                  <div>
                    <h3 className="text-lg font-medium">JNT Express</h3>
                    <p className="text-sm text-gray-500">Package Delivery Service</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-[#fdfbf7]">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tracking Number:</span>
                    <div className="flex items-center gap-2">
                      {selectedNotification.message.match(/TRACKING NUMBER:\s*([A-Za-z0-9]+)/) && (
                        <>
                          <span className="font-bold text-[#C4A484]">
                            {selectedNotification.message.match(/TRACKING NUMBER:\s*([A-Za-z0-9]+)/)[1]}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyTrackingNumber(selectedNotification.message.match(/TRACKING NUMBER:\s*([A-Za-z0-9]+)/)[1])}
                            className="h-7 p-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Message:</h4>
                    <p className="text-sm p-3 bg-white rounded border">
                      {selectedNotification.message}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>Date Received:</span>
                    <span>{format(new Date(selectedNotification.created_at), "MMM d, yyyy • h:mm a")}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Note: You may need to visit the JNT Express website to get detailed tracking information.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => setNotificationDetailsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <ErrorModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} title={errorMessage.title} message={errorMessage.message} />
    </>;
}
