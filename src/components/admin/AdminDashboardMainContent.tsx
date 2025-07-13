
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
import { Download, ShoppingCart, BarChart3, Package, Bell, Star, Trophy, MessageSquare, Users, CheckCircle, Truck, Calendar, UserPlus, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserManagement } from "./UserManagement";

export default function AdminDashboardMainContent() {
  const [dateRange, setDateRange] = useState(30);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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

  // PDF export logic (reuse from SalesCharts)
  const handleDownloadSalesReport = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      // Set Times New Roman font if available
      if (doc.getFontList && doc.getFontList()['Times New Roman']) {
        doc.setFont('Times New Roman');
      } else {
        doc.setFont('times', 'normal');
      }
      // UNVAS® Header
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('UNVAS®', 105, 20, { align: 'center' });
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Sales Report', 105, 32, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      const start = useCustomDates && customStartDate ? format(new Date(customStartDate), 'MMM dd, yyyy') : format(subDays(new Date(), dateRange), 'MMM dd, yyyy');
      const end = useCustomDates && customEndDate ? format(new Date(customEndDate), 'MMM dd, yyyy') : format(new Date(), 'MMM dd, yyyy');
      doc.text(`Report Period: ${start} - ${end}`, 105, 42, { align: 'center' });
      // Summary
      const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      doc.setFont(undefined, 'bold');
      doc.text(`Total Revenue: ₱${totalRevenue.toLocaleString()}`, 20, 55);
      doc.text(`Total Orders: ${totalOrders}`, 20, 65);
      doc.text(`Average Order Value: ₱${averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 20, 75);
      doc.setFont(undefined, 'normal');
      // Table headers
      let yPosition = 90;
      doc.setFont(undefined, 'bold');
      doc.text('Date', 20, yPosition);
      doc.text('Revenue', 60, yPosition);
      doc.text('Orders', 110, yPosition);
      doc.text('Avg Order Value', 150, yPosition);
      doc.setFont(undefined, 'normal');
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 10;
      // Table rows
      chartData.forEach((item) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const avgValue = item.orders > 0 ? item.revenue / item.orders : 0;
        doc.text(format(new Date(item.date), 'MMM dd, yyyy'), 20, yPosition);
        doc.text(`₱${item.revenue.toLocaleString()}`, 60, yPosition);
        doc.text(item.orders.toString(), 110, yPosition);
        doc.text(`₱${avgValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 150, yPosition);
        yPosition += 9;
      });
      // Footer
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text(`Generated by UNVAS® Admin Dashboard on ${format(new Date(), 'PPPppp')}`, 105, 290, { align: 'center' });
      doc.save(`sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      alert('Failed to generate PDF report');
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Top Row: Download left, Info right */}
      <div className="flex justify-between items-center mb-2">
        <Button onClick={handleDownloadSalesReport} className="flex items-center gap-2 bg-[#C4A484] hover:bg-[#a68967] text-white shadow">
          <Download className="h-4 w-4" />
          Download Sales Report (PDF)
        </Button>
        <Button variant="ghost" onClick={() => setShowInstructions(true)} className="flex items-center text-[#8B7355] p-2" title="Instructions">
          <Info className="h-6 w-6" />
        </Button>
      </div>
      {/* Instructions Modal */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[#8B7355]" />
              Admin Dashboard Guide
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-8 text-sm text-gray-800">
            {/* Steps (left) */}
            <div className="flex-1 min-w-[250px]">
              <h3 className="font-semibold text-base text-[#8B7355] mb-2 flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Order Processing Workflow</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li className="flex items-start gap-2"><ShoppingCart className="h-4 w-4 mt-0.5 text-[#8B7355]" /><span><b>Go to <span className="text-[#8B7355]">Order Management</span>:</b> Review user order details in the <b>Orders</b> sidebar section.</span></li>
                <li className="flex items-start gap-2"><Package className="h-4 w-4 mt-0.5 text-[#8B7355]" /><span><b>Check <span className="text-[#8B7355]">All Orders</span>:</b> View all incoming orders. Approve to move to <b>Processing</b>.</span></li>
                <li className="flex items-start gap-2"><Truck className="h-4 w-4 mt-0.5 text-[#8B7355]" /><span><b>Move to <span className="text-[#8B7355]">Processing</span>:</b> Review orders awaiting shipment. Click <b>Move to Delivering</b> and enter the J&T tracking number if shipped.</span></li>
                <li className="flex items-start gap-2"><Calendar className="h-4 w-4 mt-0.5 text-[#8B7355]" /><span><b>Monitor <span className="text-[#8B7355]">Delivering</span>:</b> Send the expected delivery date to the user via the <b>Notifications</b> tab. The user will be notified of the delivery date and reminded the day before delivery.</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 mt-0.5 text-[#8B7355]" /><span><b>Mark as <span className="text-[#8B7355]">Complete</span>:</b> Once delivered, mark the order as complete to finalize the process.</span></li>
              </ol>
            </div>
            {/* Sidebar Overview (right) */}
            <div className="flex-1 min-w-[250px]">
              <h3 className="font-semibold text-base text-[#8B7355] mb-2 flex items-center gap-2"><BarChart3 className="h-4 w-4" />Admin Sidebar Overview</h3>
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#8B7355]" /><b>Dashboard:</b> View sales analytics, revenue charts, and top products.</li>
                <li className="flex items-center gap-2"><Package className="h-4 w-4 text-[#8B7355]" /><b>Products:</b> Manage product listings, inventory, and details.</li>
                <li className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-[#8B7355]" /><b>Orders:</b> Oversee all customer orders and manage their status.</li>
                <li className="flex items-center gap-2"><Bell className="h-4 w-4 text-[#8B7355]" /><b>Notifications:</b> Send notifications to users, including delivery updates and bulk messages.</li>
                <li className="flex items-center gap-2"><Star className="h-4 w-4 text-[#8B7355]" /><b>Reviews:</b> Review and manage customer feedback and ratings.</li>
                <li className="flex items-center gap-2"><Trophy className="h-4 w-4 text-[#8B7355]" /><b>Achievements:</b> Manage user achievements and related content.</li>
                <li className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[#8B7355]" /><b>Chatbot:</b> Configure and manage the chatbot Q&A for user support.</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4 text-[#8B7355]" /><b>User Management:</b> Delete user accounts.</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInstructions(false)} className="bg-[#8B7355] text-white">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      {/* User Management Section */}
      <div className="grid grid-cols-1 gap-6">
        <UserManagement />
      </div>
    </div>
  );
}
