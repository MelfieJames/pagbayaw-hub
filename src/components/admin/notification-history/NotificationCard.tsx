
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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

interface NotificationCardProps {
  notification: NotificationRecord;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function NotificationCard({ notification, onDelete, isDeleting }: NotificationCardProps) {
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

  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
              disabled={isDeleting}
            >
              {isDeleting ? (
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
                onClick={() => onDelete(notification.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
