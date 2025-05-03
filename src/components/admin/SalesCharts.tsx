
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";

const CHART_COLORS = ["#6b8e68", "#8BC34A", "#FFB74D", "#FF7043", "#C4A484", "#8B7355"];

export function SalesCharts() {
  const [chartType, setChartType] = useState("area");
  
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
      
      // Group by category
      const { data: productData, error: productError } = await supabase
        .from("purchase_items")
        .select(`
          quantity, price_at_time,
          products(category)
        `)
        .gte("created_at", thirtyDaysAgo.toISOString());
        
      if (productError) throw productError;
      
      const salesByCategory = productData.reduce((acc: any, curr: any) => {
        const category = curr.products?.category || "Uncategorized";
        if (!acc[category]) {
          acc[category] = {
            category: category,
            value: 0,
          };
        }
        acc[category].value += Number(curr.price_at_time) * curr.quantity;
        return acc;
      }, {});
      
      return {
        dailySales: Object.values(salesByDay),
        categorySales: Object.values(salesByCategory),
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
          <Tabs value={chartType} onValueChange={setChartType}>
            <TabsList>
              <TabsTrigger value="area">Area</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="pie">Pie</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-4">
          <Tabs value={chartType}>
            <TabsContent value="area" className="h-full">
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
            </TabsContent>
            
            <TabsContent value="bar" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData?.dailySales}
                  margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `₱${value}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="sales" fill="#6b8e68" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="line" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData?.dailySales}
                  margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `₱${value}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#6b8e68"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="pie" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesData?.categorySales}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) => `${entry.category}: ${formatCurrency(entry.value)}`}
                  >
                    {salesData?.categorySales.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
