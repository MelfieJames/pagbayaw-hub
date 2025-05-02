import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesCharts } from "./SalesCharts";
import { PurchasesManagement } from "./PurchasesManagement";
import { UserManagement } from "./UserManagement";
import { AdminManagement } from "./AdminManagement";
import { LayoutDashboard, ShoppingBag, User, Shield } from "lucide-react";

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

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="mb-4 grid grid-cols-3 md:w-[400px] bg-[#f0e8d9]">
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admins
          </TabsTrigger>
        </TabsList>
        
        {/* Wrapping each section in a box with overflow and scrollbar */}
        <div className="space-y-4">
          <TabsContent value="purchases">
            <div className="bg-white rounded-lg shadow-lg p-4 max-h-[400px] overflow-y-auto">
              <PurchasesManagement />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-white rounded-lg shadow-lg p-4 max-h-[400px] overflow-y-auto">
              <UserManagement />
            </div>
          </TabsContent>

          <TabsContent value="admins">
            <div className="bg-white rounded-lg shadow-lg p-4 max-h-[400px] overflow-y-auto">
              <AdminManagement />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
