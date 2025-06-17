
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, History, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface NotificationRecord {
  id: number;
  message: string;
  type: string;
  created_at: string;
  tracking_number?: string;
  expected_delivery_date?: string;
  user_id: string;
  purchase_id?: number;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notification history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Notification deleted successfully");
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tracking_update':
        return 'bg-[#8B7355] text-white';
      case 'order':
        return 'bg-blue-500 text-white';
      case 'general':
        return 'bg-green-500 text-white';
      case 'review_request':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-[#C4A484]">
        <CardContent className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <CardTitle className="text-[#8B7355] flex items-center gap-2">
          <History className="h-5 w-5" />
          Notification History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>No notifications sent yet</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      <div>
                        <strong>Sent to:</strong> {notification.profiles?.first_name} {notification.profiles?.last_name} ({notification.profiles?.email})
                      </div>
                      {notification.purchase_id && (
                        <div><strong>Order:</strong> #{notification.purchase_id}</div>
                      )}
                      {notification.tracking_number && (
                        <div><strong>Tracking:</strong> {notification.tracking_number}</div>
                      )}
                      {notification.expected_delivery_date && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expected: {format(new Date(notification.expected_delivery_date), "MMM d, yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === notification.id}
                      >
                        {deletingId === notification.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this notification? This action cannot be undone and will remove it from the user's notifications as well.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
