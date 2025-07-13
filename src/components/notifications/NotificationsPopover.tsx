
import { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "./hooks/useNotifications";
import { usePurchaseDetails } from "./hooks/usePurchaseDetails";
import { NotificationItem } from "./NotificationItem";
import { NotificationDetailsDialog } from "./NotificationDetailsDialog";
import { Notification } from "./types";

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const {
    notifications,
    isLoading,
    unreadCount,
    markAsReadMutation,
    markAllAsReadMutation,
  } = useNotifications();

  const { purchaseDetails } = usePurchaseDetails(selectedNotification);

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

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative bg-yellow-100 hover:bg-yellow-200 rounded-full shadow-md transition-all duration-200 group" style={{ width: 48, height: 48 }}>
            <Bell className="h-7 w-7 text-yellow-700 transition-transform duration-200 group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className={`absolute top-0 right-0 h-6 w-6 text-xs flex items-center justify-center rounded-full bg-red-600 text-white font-bold shadow-lg animate-pop transition-all duration-200`}>{unreadCount}</span>
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
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    onViewDetails={viewNotificationDetails}
                  />
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
      
      <NotificationDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        selectedNotification={selectedNotification}
        purchaseDetails={purchaseDetails}
      />
    </>
  );
}
