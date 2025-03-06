
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { 
  Award, 
  LogOut, 
  ShoppingBag, 
  Star, 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  Search,
  Bell,
  User
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch admin profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          purchases(user_id),
          products(product_name, image)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.isAdmin
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch inventory
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products(product_name, category, image)
        `)
        .order('quantity', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch purchases for sales data
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['admin-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_items(product_id, quantity, price_at_time, products(product_name, category))
        `)
        .eq('status', 'completed');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch users count
  const { data: usersCount = 0, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch achievements count
  const { data: achievementsCount = 0, isLoading: achievementsLoading } = useQuery({
    queryKey: ['admin-achievements-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Calculate total revenue
  const totalRevenue = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total_amount), 0);

  // Get latest product
  const latestProduct = products.length > 0 ? products[0] : null;

  // Get low inventory items
  const lowInventoryItem = inventory.length > 0 ? inventory[0] : null;

  // Prepare sales data for charts
  const prepareSalesData = () => {
    // Create a map to store sales data by category or product
    const salesMap = new Map();
    
    purchases.forEach(purchase => {
      if (purchase.purchase_items) {
        purchase.purchase_items.forEach((item: any) => {
          if (!item.products) return;
          
          const key = selectedCategory === 'all' 
            ? item.products.category
            : item.products.product_name;
          
          if (selectedCategory !== 'all' && item.products.category !== selectedCategory) return;
          
          const amount = parseFloat(item.price_at_time) * item.quantity;
          
          if (salesMap.has(key)) {
            salesMap.set(key, salesMap.get(key) + amount);
          } else {
            salesMap.set(key, amount);
          }
        });
      }
    });
    
    // Convert the map to an array of objects for recharts
    return Array.from(salesMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const salesData = prepareSalesData();

  // Filter products by category for the dropdown
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#8DD1E1'];

  // Function to generate weekly sales data
  const generateWeeklySalesData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map(week => {
      const obj: any = { name: week };
      salesData.forEach(item => {
        obj[item.name] = Math.random() * 1000; // Random data for demonstration
      });
      return obj;
    });
  };

  const weeklySalesData = generateWeeklySalesData();

  const isLoading = profileLoading || notificationsLoading || productsLoading || 
                   inventoryLoading || purchasesLoading || usersLoading || achievementsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#8B7355] text-white">
        <div className="p-4 flex items-center gap-2">
          <img src="/lovable-uploads/5c03a00c-16fb-4305-bb33-b3a748c95b67.png" alt="Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-xl font-bold">ADMIN</h1>
        </div>
        
        <nav className="mt-8 flex flex-col h-[calc(100%-4rem)]">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-[#9b815f] text-white">
            <Star className="w-6 h-6" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/achievements" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Award className="w-6 h-6" />
            <span>Add Achievements</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <ShoppingBag className="w-6 h-6" />
            <span>Add Products</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Star className="w-6 h-6" />
            <span>View Rating</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white mt-auto"
          >
            <LogOut className="w-6 h-6" />
            <span>Log Out</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Admin Profile Section */}
        <Card className="mb-6 border-2 border-[#C4A484]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-[#8B7355]">
                <AvatarImage src="/placeholder.svg" alt={user?.name || "Admin"} />
                <AvatarFallback className="bg-[#8B7355] text-white text-xl">
                  {(user?.name || "Admin").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-[#8B7355]">{user?.name || "Admin"}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-[#8B7355]">Admin</Badge>
                </div>
              </div>
              
              <div className="ml-auto flex items-center">
                <div className="relative">
                  <Bell className="w-6 h-6 text-[#8B7355]" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Events Card */}
          <Card className="border-2 border-[#C4A484]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-[#8B7355] flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{achievementsCount}</div>
              <p className="text-xs text-gray-500 mt-1">achievements posted</p>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="border-2 border-[#C4A484]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-[#8B7355] flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-gray-500 mt-1">from all sales</p>
            </CardContent>
          </Card>

          {/* Total Users Card */}
          <Card className="border-2 border-[#C4A484]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-[#8B7355] flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usersCount}</div>
              <p className="text-xs text-gray-500 mt-1">registered accounts</p>
            </CardContent>
          </Card>

          {/* Low Inventory Card */}
          <Card className="border-2 border-[#C4A484]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-[#8B7355] flex items-center gap-2">
                <Package className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowInventoryItem ? (
                <>
                  <div className="text-3xl font-bold">{lowInventoryItem.quantity}</div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {lowInventoryItem.products?.product_name || "No product"}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No inventory items</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Analytics */}
          <Card className="lg:col-span-2 border-2 border-[#C4A484]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#8B7355]">Sales Analytics</CardTitle>
                <div className="flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="line" onClick={() => setChartType("line")}>Line</TabsTrigger>
                    <TabsTrigger value="pie" onClick={() => setChartType("pie")}>Pie</TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center">
                  <label htmlFor="category" className="mr-2 text-sm">Category:</label>
                  <select 
                    id="category"
                    className="border rounded px-2 py-1 text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {chartType === "pie" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklySalesData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      {salesData.map((item, index) => (
                        <Line
                          key={item.name}
                          type="monotone"
                          dataKey={item.name}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Latest Notifications */}
          <Card className="border-2 border-[#C4A484]">
            <CardHeader>
              <CardTitle className="text-[#8B7355] flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Latest Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-[#8B7355] text-white">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No notifications</p>
                )}
                
                {notifications.length > 0 && (
                  <Button variant="outline" className="w-full mt-2">
                    View All Notifications
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Latest Product Card */}
          <Card className="rounded-3xl border-2 border-[#C4A484]">
            <CardHeader>
              <CardTitle className="text-black font-bold">LATEST PRODUCT ADDED</CardTitle>
            </CardHeader>
            <CardContent>
              {latestProduct ? (
                <div className="flex items-center gap-4">
                  <img 
                    src={latestProduct.image || "/placeholder.svg"} 
                    alt={latestProduct.product_name} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div>
                    <p><span className="font-bold">Product Name:</span> {latestProduct.product_name}</p>
                    <p><span className="font-bold">Category:</span> {latestProduct.category}</p>
                    <p><span className="font-bold">Price:</span> {formatCurrency(parseFloat(latestProduct.product_price))}</p>
                    <Link to="/admin/products">
                      <Button className="mt-2 bg-[#8B7355] text-white hover:bg-[#9b815f]">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        View Products
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No products yet</p>
              )}
            </CardContent>
          </Card>

          {/* Latest Achievement Card */}
          <Card className="rounded-3xl border-2 border-[#C4A484]">
            <CardHeader>
              <CardTitle className="text-black font-bold">LATEST ACHIEVEMENT ADDED</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img src="/placeholder.svg" alt="Achievement" className="w-24 h-24 object-cover rounded-md" />
                <div>
                  <p><span className="font-bold">Achievement Name:</span></p>
                  <p>Golden Horizon Award</p>
                  <Link to="/admin/achievements">
                    <Button className="mt-2 bg-[#8B7355] text-white hover:bg-[#9b815f]">
                      <Award className="w-4 h-4 mr-2" />
                      View Achievements
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
