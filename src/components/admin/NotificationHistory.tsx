
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { NotificationCard } from "./notification-history/NotificationCard";
import { useNotificationHistory } from "./notification-history/useNotificationHistory";

export function NotificationHistory() {
  const { notifications, isLoading, deletingId, handleDeleteNotification } = useNotificationHistory();

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
              <NotificationCard
                key={notification.id}
                notification={notification}
                onDelete={handleDeleteNotification}
                isDeleting={deletingId === notification.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
