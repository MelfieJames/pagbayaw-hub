
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProductSale {
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_time: number;
  total: number;
}

interface DailySales {
  date: string;
  sales: number;
}

interface ProductData {
  product_name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export function SalesCharts() {
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [salesByDay, setSalesByDay] = useState<DailySales[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<ProductData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('week');
  
  const { data: purchaseData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['admin-sales-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          total_amount,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Purchases fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
  });
  
  const { data: purchaseItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['admin-sales-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_items')
        .select(`
          product_id,
          quantity,
          price_at_time,
          products (
            product_name
          )
        `);
      
      if (error) {
        console.error("Purchase items fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
  });
  
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error("Profiles fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  useEffect(() => {
    if (purchaseData) {
      processDailySalesData();
    }
  }, [purchaseData, selectedTimeRange]);
  
  useEffect(() => {
    if (purchaseItems) {
      processTopProductsData();
    }
  }, [purchaseItems]);
  
  useEffect(() => {
    if (profilesData) {
      processProfileCompletionData();
    }
  }, [profilesData]);

  const processDailySalesData = () => {
    if (!purchaseData) return;
    
    let daysToInclude = 7;
    if (selectedTimeRange === 'month') daysToInclude = 30;
    if (selectedTimeRange === 'year') daysToInclude = 365;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysToInclude);
    
    const dateMap: Record<string, number> = {};
    
    // Initialize all dates in range with 0 sales
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      dateMap[dateString] = 0;
    }
    
    // Add sales for each date
    purchaseData.forEach(purchase => {
      const purchaseDate = new Date(purchase.created_at).toISOString().split('T')[0];
      if (dateMap[purchaseDate] !== undefined) {
        dateMap[purchaseDate] += purchase.total_amount;
      }
    });
    
    // Convert to array for chart
    const salesData = Object.entries(dateMap).map(([date, sales]) => ({
      date,
      sales: Number(sales.toFixed(2))
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    setSalesByDay(salesData);
  };
  
  const processTopProductsData = () => {
    if (!purchaseItems) return;
    
    const productSales: Record<number, ProductSale> = {};
    
    purchaseItems.forEach(item => {
      const productId = item.product_id;
      // Fix the type issue by accessing the products object correctly
      const productName = item.products?.product_name || `Product ${productId}`;
      const quantity = item.quantity || 0;
      const price = item.price_at_time || 0;
      
      if (!productSales[productId]) {
        productSales[productId] = {
          product_id: productId,
          product_name: productName,
          quantity: 0,
          price_at_time: price,
          total: 0
        };
      }
      
      productSales[productId].quantity += quantity;
      productSales[productId].total += quantity * price;
    });
    
    // Convert to array and sort by total sales
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Get top 5
    
    // Format for the pie chart
    const topProductsData = sortedProducts.map((product, index) => ({
      product_name: product.product_name,
      value: product.total,
      color: COLORS[index % COLORS.length]
    }));
    
    setTopProducts(topProductsData);
  };
  
  const processProfileCompletionData = () => {
    if (!profilesData) return;
    
    let complete = 0;
    let incomplete = 0;
    
    profilesData.forEach(profile => {
      if (profile.first_name && profile.last_name && profile.phone_number && profile.location) {
        complete++;
      } else {
        incomplete++;
      }
    });
    
    setProfileCompletion([
      { product_name: 'Complete', value: complete, color: '#82ca9d' },
      { product_name: 'Incomplete', value: incomplete, color: '#FF8042' }
    ]);
  };

  const isLoading = purchasesLoading || itemsLoading || profilesLoading;

  if (isLoading) {
    return (
      <Card className="border-2 border-[#C4A484]">
        <CardHeader>
          <CardTitle className="text-[#8B7355]">Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="border-2 border-[#C4A484]">
        <CardHeader>
          <CardTitle className="text-[#8B7355]">Sales Overview</CardTitle>
          <CardDescription>
            <Tabs defaultValue="week" className="w-full" onValueChange={setSelectedTimeRange}>
              <TabsList className="mb-2 bg-[#f0e8d9]">
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="year">This Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesByDay}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₱${value}`, 'Sales']} />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8B7355" 
                  fill="#C4A484" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Products Chart */}
        <Card className="border-2 border-[#C4A484]">
          <CardHeader>
            <CardTitle className="text-[#8B7355]">Top Products</CardTitle>
            <CardDescription>Top 5 selling products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="product_name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
                  <Bar dataKey="value">
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Chart */}
        <Card className="border-2 border-[#C4A484]">
          <CardHeader>
            <CardTitle className="text-[#8B7355]">Profile Completion</CardTitle>
            <CardDescription>Number of users with completed profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profileCompletion}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="product_name"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {profileCompletion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value) => [value, 'Users']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
