
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkNotificationSender } from "./BulkNotificationSender";
import { Bell, Users } from "lucide-react";

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
        <Tabs defaultValue="bulk" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bulk" className="mt-6">
            <BulkNotificationSender />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
