
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesCharts } from "./SalesCharts";
import { TopRevenueProducts } from "./TopRevenueProducts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminDashboardMainContent() {
  const [dateRange, setDateRange] = useState(30);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [useCustomDates, setUseCustomDates] = useState(false);

  const { data: dashboardData = [], isLoading: dashboardLoading } = useQuery({
    queryKey: ['admin-dashboard-data', dateRange, customStartDate, customEndDate, useCustomDates],
    queryFn: async () => {
      const startDate = useCustomDates && customStartDate 
        ? startOfDay(new Date(customStartDate))
        : startOfDay(subDays(new Date(), dateRange));
      const endDate = useCustomDates && customEndDate 
        ? endOfDay(new Date(customEndDate))
        : endOfDay(new Date());

      const { data: purchases, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_items(*, products(*))
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return [];
      }
      
      return purchases || [];
    }
  });

  const processedData = dashboardData.reduce((acc: any, purchase: any) => {
    const date = format(new Date(purchase.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { 
        date, 
        revenue: 0, 
        orders: 0, 
        items: 0,
        avgOrderValue: 0 
      };
    }
    acc[date].revenue += Number(purchase.total_amount);
    acc[date].orders += 1;
    acc[date].items += purchase.purchase_items?.length || 0;
    return acc;
  }, {});

  const chartData = Object.values(processedData).map((item: any) => ({
    ...item,
    avgOrderValue: item.orders > 0 ? item.revenue / item.orders : 0
  }));

  const statusData = dashboardData.reduce((acc: any, purchase: any) => {
    const status = purchase.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count as number
  }));

  const COLORS = ['#C4A484', '#8B7355', '#DEB887', '#F4A460', '#CD853F'];

  if (dashboardLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Date Range Controls */}
      <Card className="border-2 border-[#C4A484]">
        <CardHeader className="bg-[#F5F5DC]">
          <CardTitle className="text-[#8B7355]">Date Range Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex gap-2">
              <Button 
                variant={!useCustomDates && dateRange === 7 ? "default" : "outline"}
                onClick={() => {setDateRange(7); setUseCustomDates(false);}}
                className="bg-[#8B7355] hover:bg-[#7a624d] text-white"
              >
                7 Days
              </Button>
              <Button 
                variant={!useCustomDates && dateRange === 30 ? "default" : "outline"}
                onClick={() => {setDateRange(30); setUseCustomDates(false);}}
                className="bg-[#8B7355] hover:bg-[#7a624d] text-white"
              >
                30 Days
              </Button>
              <Button 
                variant={!useCustomDates && dateRange === 90 ? "default" : "outline"}
                onClick={() => {setDateRange(90); setUseCustomDates(false);}}
                className="bg-[#8B7355] hover:bg-[#7a624d] text-white"
              >
                90 Days
              </Button>
            </div>
            <div className="flex gap-2 items-end">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setUseCustomDates(true)}
                disabled={!customStartDate || !customEndDate}
                className="bg-[#C4A484] hover:bg-[#a68967] text-white"
              >
                Apply Custom Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-2 border-[#C4A484]">
          <CardHeader className="bg-[#F5F5DC]">
            <CardTitle className="text-[#8B7355]">Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis tickFormatter={(value) => `₱${value}`} />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value) => [`₱${value}`, 'Revenue']}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#C4A484" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="border-2 border-[#C4A484]">
          <CardHeader className="bg-[#F5F5DC]">
            <CardTitle className="text-[#8B7355]">Daily Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value) => [value, 'Orders']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#8B7355" 
                  strokeWidth={3}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Order Value Chart */}
        <Card className="border-2 border-[#C4A484]">
          <CardHeader className="bg-[#F5F5DC]">
            <CardTitle className="text-[#8B7355]">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis tickFormatter={(value) => `₱${value}`} />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Avg Order Value']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgOrderValue" 
                  stroke="#DEB887" 
                  strokeWidth={3}
                  name="Avg Order Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="border-2 border-[#C4A484]">
          <CardHeader className="bg-[#F5F5DC]">
            <CardTitle className="text-[#8B7355]">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <TopRevenueProducts />
      </div>
    </div>
  );
}
