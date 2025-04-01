
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./UserManagement";
import { AdminManagement } from "./AdminManagement";
import { RecentPurchases } from "./RecentPurchases";
import SalesCharts from "./SalesCharts";

export default function AdminDashboardMainContent() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-8">
        <SalesCharts />
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4 grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="admins">
          <AdminManagement />
        </TabsContent>
        <TabsContent value="purchases">
          <RecentPurchases />
        </TabsContent>
      </Tabs>
    </div>
  );
}
