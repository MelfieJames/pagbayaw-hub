
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesCharts } from "./SalesCharts";
import { PurchasesManagement } from "./PurchasesManagement";
import { LayoutDashboard, ShoppingBag } from "lucide-react";

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
        <TabsList className="mb-4 grid md:w-[200px] bg-[#f0e8d9]">
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Purchases
          </TabsTrigger>
        </TabsList>
        <TabsContent value="purchases">
          <PurchasesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
