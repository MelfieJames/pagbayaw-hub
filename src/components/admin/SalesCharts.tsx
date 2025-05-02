import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, Legend
} from 'recharts';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Search, TrendingUp, ShoppingCart } from 'lucide-react';

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

interface PurchaseItem {
  product_id: number;
  quantity: number;
  price_at_time: number;
  products: {
    product_name: string;
  } | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export function SalesCharts() {
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [salesByDay, setSalesByDay] = useState<DailySales[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('week');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: purchaseData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['admin-sales-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`id, total_amount, created_at`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: purchaseItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['admin-sales-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_items')
        .select(`product_id, quantity, price_at_time, products (product_name)`);

      if (error) throw error;
      return (data as unknown) as PurchaseItem[] || [];
    },
  });

  useEffect(() => {
    if (purchaseData) processDailySalesData();
  }, [purchaseData, selectedTimeRange]);

  useEffect(() => {
    if (purchaseItems) processTopProductsData();
  }, [purchaseItems]);

  useEffect(() => {
    filterProducts();
  }, [topProducts, searchTerm]);

  const processDailySalesData = () => {
    if (!purchaseData) return;

    let daysToInclude = 7;
    if (selectedTimeRange === 'month') daysToInclude = 30;
    if (selectedTimeRange === 'year') daysToInclude = 365;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysToInclude);

    const dateMap: Record<string, number> = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      dateMap[dateString] = 0;
    }

    purchaseData.forEach(purchase => {
      const purchaseDate = new Date(purchase.created_at).toISOString().split('T')[0];
      if (dateMap[purchaseDate] !== undefined) {
        dateMap[purchaseDate] += purchase.total_amount;
      }
    });

    const salesData = Object.entries(dateMap).map(([date, sales]) => ({
      date,
      sales: Number(sales.toFixed(2))
    })).sort((a, b) => a.date.localeCompare(b.date));

    setSalesByDay(salesData);
  };

  const processTopProductsData = () => {
    if (!purchaseItems) return;

    const productSales: Record<number, ProductSale> = {};

    purchaseItems.forEach((item) => {
      const productId = item.product_id;
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

    const sortedProducts = Object.values(productSales).sort((a, b) => b.total - a.total);

    const topProductsData: ProductData[] = sortedProducts.map((product, index) => ({
      product_name: product.product_name,
      value: product.total,
      color: COLORS[index % COLORS.length]
    }));

    setTopProducts(topProductsData);
    setFilteredProducts(topProductsData.slice(0, 5));
  };

  const filterProducts = () => {
    const filtered = topProducts
      .filter(product => product.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);

    setFilteredProducts(filtered);
  };

  const isLoading = purchasesLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <Card className="border-2 border-[#C4A484] shadow-md">
          <CardHeader>
            <CardTitle className="text-[#8B7355] flex items-center gap-2">
              <TrendingUp size={20} /> Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10 px-4">
      {/* Sales Overview Area Chart */}
      <Card className="border-2 border-[#C4A484] shadow-md">
        <CardHeader>
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <TrendingUp size={20} /> Sales Overview
          </CardTitle>
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
              <AreaChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₱${value}`, 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#8B7355" fill="#C4A484" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Products Bar Chart */}
      <Card className="border-2 border-[#C4A484] shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-[#8B7355] flex items-center gap-2">
                <ShoppingCart size={20} /> Top Products by Revenue
              </CardTitle>
              <CardDescription>Top selling products based on total revenue</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredProducts} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="product_name" angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis />
                <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="value" name="Revenue">
                  {filteredProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
