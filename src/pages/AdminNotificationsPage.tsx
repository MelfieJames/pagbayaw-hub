
import { useState } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  id: number;
  message: string;
  created_at: string;
  type: string;
  is_read: boolean;
  purchase_id: number | null;
}

export default function AdminNotificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
  });

  const getNotificationColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
        return 'bg-blue-500';
      case 'system':
        return 'bg-purple-500';
      case 'inventory':
        return 'bg-amber-500';
      case 'alert':
        return 'bg-red-500';
      case 'tracking_update':
        return 'bg-[#C4A484]';
      default:
        return 'bg-gray-500';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
        return <CheckCircle className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-[500px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-red-500">Error loading notifications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold text-[#8B7355]">Notifications Management</h2>
        
        <Tabs defaultValue="notifications">
          <TabsList className="mb-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <Card className="mt-6 border-2 border-[#C4A484]">
            <CardHeader className="bg-[#F5F5DC]">
              <CardTitle className="text-[#8B7355] flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="notifications">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No notifications found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-lg border ${notification.is_read ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <div className="flex items-center gap-3">
                          {notification.type === 'tracking_update' ? (
                            <img 
                              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQatUFPGvANNitDui-MpHNzvKz-V4BgYISitQ&s" 
                              alt="JNT Logo" 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`${getNotificationColor(notification.type)} p-2 rounded-full text-white`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-gray-800">{notification.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {format(new Date(notification.created_at), "MMM d, yyyy • h:mm a")}
                              </span>
                              <Badge variant="outline" className={getNotificationColor(notification.type) + " text-white"}>
                                {notification.type === 'tracking_update' ? 'Tracking Update' : notification.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
