
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStats } from "./AdminStats";
import { SalesCharts } from "./SalesCharts";
import { RecentPurchases } from "./RecentPurchases";
import { TopRevenueProducts } from "./TopRevenueProducts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function AdminDashboardMainContent() {
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-dashboard-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
      
      return data || [];
    }
  });

  if (reviewsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <AdminStats reviews={reviews} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesCharts />
        <TopRevenueProducts />
      </div>
      
      <RecentPurchases />
    </div>
  );
}
