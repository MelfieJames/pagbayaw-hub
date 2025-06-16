
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackingNotificationForm } from "./TrackingNotificationForm";
import { NotificationHistory } from "./NotificationHistory";
import { BulkNotificationSender } from "./BulkNotificationSender";
import { Bell, Send, Truck, History, Users } from "lucide-react";

export function NotificationManagement() {
  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <CardTitle className="text-[#8B7355] flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tracking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Tracking Updates
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Notifications
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking" className="mt-6">
            <TrackingNotificationForm />
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-6">
            <BulkNotificationSender />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <NotificationHistory />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
