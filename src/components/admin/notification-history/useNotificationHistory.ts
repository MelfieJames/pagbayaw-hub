
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";

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

export function useNotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading,
    deletingId,
    handleDeleteNotification,
  };
}
