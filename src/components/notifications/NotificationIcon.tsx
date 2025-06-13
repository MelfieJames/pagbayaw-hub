
import { Bell, CheckCircle, AlertTriangle, Package, Star } from "lucide-react";

interface NotificationIconProps {
  type: string;
  className?: string;
}

export function NotificationIcon({ type, className = "h-5 w-5" }: NotificationIconProps) {
  switch (type?.toLowerCase()) {
    case 'order':
      return <CheckCircle className={className} />;
    case 'alert':
      return <AlertTriangle className={className} />;
    case 'tracking_update':
      return <Package className={className} />;
    case 'review_request':
      return <Star className={className} />;
    default:
      return <Bell className={className} />;
  }
}

export function getNotificationColor(type: string) {
  switch (type?.toLowerCase()) {
    case 'order':
      return 'bg-blue-600';
    case 'system':
      return 'bg-slate-600';
    case 'inventory':
      return 'bg-amber-600';
    case 'alert':
      return 'bg-red-600';
    case 'tracking_update':
      return 'bg-slate-700';
    case 'review_request':
      return 'bg-orange-600';
    default:
      return 'bg-gray-600';
  }
}
