
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./UserManagement";
import { AdminManagement } from "./AdminManagement";
import { SalesCharts } from "./SalesCharts";
import { LayoutDashboard, Users, Shield, ShoppingBag } from "lucide-react";

export default function AdminDashboardMainContent() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-[#8B7355]">
        <LayoutDashboard className="h-7 w-7" />
        Dashboard
      </h1>
      
      <div className="mb-8">
        <SalesCharts />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 md:w-[300px] bg-[#f0e8d9]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admins
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="admins">
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
