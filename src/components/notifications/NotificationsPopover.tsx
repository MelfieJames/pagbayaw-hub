
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

export function NotificationsPopover() {
  const { user } = useAuth();
  const [reviewProduct, setReviewProduct] = useState<{
    id: number;
    name: string;
    purchaseId: number;
  } | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          purchases (
            id,
            total_amount,
            status
          ),
          purchase_items (
            product_id,
            products (
              product_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (notificationId: number) => {
    if (!user?.id) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  };

  const handleSubmitReview = async () => {
    if (!user?.id || !reviewProduct) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: reviewProduct.id,
          rating,
          comment,
          purchase_item_id: reviewProduct.purchaseId
        });

      if (error) throw error;

      toast("Review submitted successfully!");
      setReviewProduct(null);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error('Error submitting review:', error);
      toast("Failed to submit review");
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <h4 className="font-semibold mb-4">Notifications</h4>
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications yet
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      !notification.is_read ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <p className="text-sm">{notification.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline">
                        {notification.purchases?.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), 'PP')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Dialog open={!!reviewProduct} onOpenChange={() => setReviewProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate & Review {reviewProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star className="h-6 w-6" fill={rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleSubmitReview} disabled={rating === 0}>
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
