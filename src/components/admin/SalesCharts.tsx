
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

export function SalesCharts() {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["admin-sales-data"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from("purchases")
        .select("id, created_at, total_amount, status")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .neq("status", "cancelled")
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      
      // Group by day
      const salesByDay = data.reduce((acc: any, curr: any) => {
        const date = format(new Date(curr.created_at), "MMM dd");
        if (!acc[date]) {
          acc[date] = {
            date: date,
            sales: 0,
            orders: 0,
          };
        }
        acc[date].sales += Number(curr.total_amount);
        acc[date].orders += 1;
        return acc;
      }, {});
      
      return {
        dailySales: Object.values(salesByDay),
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-[#C4A484]">
        <CardHeader className="bg-[#F5F5DC]">
          <CardTitle className="text-[#8B7355]">Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#8B7355]">Sales Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesData?.dailySales}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b8e68" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6b8e68" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `₱${value}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#6b8e68"
                fillOpacity={1}
                fill="url(#colorSales)"
                name="Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
