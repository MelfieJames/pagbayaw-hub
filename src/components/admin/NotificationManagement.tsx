
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BellRing, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface NotificationData {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
  tracking_number?: string;
}

export function NotificationManagement() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      toast.success("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="shadow-lg bg-[#fdfbf7] border-[#e5e2dd]">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BellRing className="h-5 w-5 text-[#8B7355]" />
          All Notifications
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications found
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="p-4 border rounded-md bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        {notification.type}
                      </span>
                      {notification.tracking_number && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                          Tracking: {notification.tracking_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNotification(notification.id)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
