
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  PackageCheck,
  ShoppingCart,
  ChevronsUpDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  type: 'new_product' | 'purchase_update';
  message: string;
  timeAgo: string;
  isRead: boolean;
}

export function NotificationsPopover() {
  const { user } = useAuth();

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
    
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          total_amount,
          created_at,
          purchase_items (
            quantity,
            products (
              product_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const combinedNotifications = [...(notifications || [])];

  if (purchases && purchases.length > 0) {
    purchases.forEach(purchase => {
      const timeAgo = formatDistanceToNow(new Date(purchase.created_at), {
        addSuffix: true,
      });
      purchase.purchase_items.forEach(item => {
        const productName = item.products?.product_name || 'Unknown Product';
        
        combinedNotifications.push({
          type: 'purchase_update',
          message: `You purchased ${item.quantity} ${item.quantity > 1 ? 'items' : 'item'} - ${productName}`,
          timeAgo: timeAgo,
          isRead: false,
          created_at: purchase.created_at,
        } as any);
      });
    });
  }

  combinedNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {combinedNotifications.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-xs"
              variant="destructive"
            >
              {combinedNotifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <ScrollArea className="h-[300px] pr-4">
          {combinedNotifications.length > 0 ? (
            combinedNotifications.map((notification, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 border-b px-4 py-3 last:border-none"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 text-sm">
                  <p className="line-clamp-1">{notification.message}</p>
                  <time className="text-xs text-muted-foreground">
                    {notification.timeAgo}
                  </time>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
