import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface SalesDataItem {
  date: string;
  total: number;
}

interface ProductSalesItem {
  product_name: string;
  total_sold: number;
  revenue: number;
}

interface ProductData {
  product_name: string;
}

interface ProfileStat {
  completed: number;
  incomplete: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#45B39D'];

export default function SalesCharts() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', timeRange],
    queryFn: async () => {
      let startDate;
      const now = new Date();
      
      if (timeRange === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      const { data, error } = await supabase
        .from('purchases')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Process and format data based on time range
      const formattedData: SalesDataItem[] = [];
      const dateGroups: Record<string, number> = {};
      
      data.forEach(purchase => {
        const date = new Date(purchase.created_at);
        let dateKey: string;
        
        if (timeRange === 'week') {
          dateKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (timeRange === 'month') {
          dateKey = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        } else {
          dateKey = date.toLocaleDateString('en-US', { month: 'short' });
        }
        
        if (dateGroups[dateKey]) {
          dateGroups[dateKey] += Number(purchase.total_amount);
        } else {
          dateGroups[dateKey] = Number(purchase.total_amount);
        }
      });
      
      Object.keys(dateGroups).forEach(date => {
        formattedData.push({
          date,
          total: dateGroups[date]
        });
      });
      
      return formattedData;
    },
  });
  
  const { data: productSalesData, isLoading: productSalesLoading } = useQuery({
    queryKey: ['product-sales-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_items')
        .select(`
          quantity,
          price_at_time,
          product_id,
          products (
            product_name
          )
        `);
        
      if (error) throw error;
      
      const productSales: Record<number, ProductSalesItem> = {};
      
      data.forEach(item => {
        const productId = item.product_id;
        const productObj = item.products as ProductData;
        const productName = productObj?.product_name || `Product ${productId}`;
        const quantity = item.quantity || 0;
        const price = item.price_at_time || 0;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            product_name: productName,
            total_sold: quantity,
            revenue: quantity * price
          };
        } else {
          productSales[productId].total_sold += quantity;
          productSales[productId].revenue += quantity * price;
        }
      });
      
      return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }
  });

  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles-completion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone_number, location');
        
      if (error) throw error;
      
      let completed = 0;
      let incomplete = 0;
      
      data.forEach(profile => {
        if (profile.first_name && 
            profile.last_name && 
            profile.phone_number && 
            profile.location) {
          completed++;
        } else {
          incomplete++;
        }
      });
      
      return {
        completed,
        incomplete
      };
    }
  });

  const profilePieData = profilesData ? [
    { name: 'Complete Profiles', value: profilesData.completed },
    { name: 'Incomplete Profiles', value: profilesData.incomplete }
  ] : [];

  if (salesLoading || productSalesLoading || profilesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="profiles">Profile Completion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Overview</CardTitle>
                <div className="flex gap-2">
                  <TabsList>
                    <TabsTrigger 
                      value="week" 
                      onClick={() => setTimeRange('week')}
                      className={timeRange === 'week' ? "bg-primary text-primary-foreground" : ""}
                    >
                      Week
                    </TabsTrigger>
                    <TabsTrigger 
                      value="month" 
                      onClick={() => setTimeRange('month')}
                      className={timeRange === 'month' ? "bg-primary text-primary-foreground" : ""}
                    >
                      Month
                    </TabsTrigger>
                    <TabsTrigger 
                      value="year" 
                      onClick={() => setTimeRange('year')}
                      className={timeRange === 'year' ? "bg-primary text-primary-foreground" : ""}
                    >
                      Year
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <CardDescription>
                Revenue generated over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Bar dataKey="total" fill="#8884d8" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Products with highest revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productSalesData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 80,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="product_name" 
                      width={80}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') return [`₱${value.toFixed(2)}`, 'Revenue'];
                        return [value, 'Units Sold'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                    <Bar dataKey="total_sold" fill="#82ca9d" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>User Profile Completion</CardTitle>
              <CardDescription>
                Status of user profile completion
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={profilePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {profilePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
