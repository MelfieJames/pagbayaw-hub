
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendNotificationForm } from "./SendNotificationForm";
import { TrackingNotificationForm } from "./TrackingNotificationForm";
import { Bell, Send, Truck } from "lucide-react";

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
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              General Notifications
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Order Updates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <SendNotificationForm />
          </TabsContent>
          
          <TabsContent value="tracking" className="mt-6">
            <TrackingNotificationForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
