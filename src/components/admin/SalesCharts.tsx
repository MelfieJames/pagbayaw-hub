
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { toast } from "sonner";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export function SalesCharts() {
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['sales-data'],
    queryFn: async () => {
      const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
      
      const { data, error } = await supabase
        .from('purchases')
        .select('created_at, total_amount, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .lte('created_at', endOfDay(new Date()).toISOString());

      if (error) throw error;

      // Group by date and calculate daily revenue and order count
      const groupedData: { [key: string]: { revenue: number; orders: number } } = {};
      
      data.forEach((purchase) => {
        const date = format(new Date(purchase.created_at), 'yyyy-MM-dd');
        if (!groupedData[date]) {
          groupedData[date] = { revenue: 0, orders: 0 };
        }
        groupedData[date].revenue += Number(purchase.total_amount);
        groupedData[date].orders += 1;
      });

      // Convert to array and sort by date
      const chartData: SalesData[] = Object.entries(groupedData)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return chartData;
    },
  });

  const generateSalesPDF = async () => {
    try {
      // Dynamic import to reduce bundle size
      const jsPDF = (await import('jspdf')).default;
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Sales Report', 20, 20);
      
      // Add date range
      doc.setFontSize(12);
      doc.text(`Report Period: ${format(subDays(new Date(), 30), 'MMM dd, yyyy')} - ${format(new Date(), 'MMM dd, yyyy')}`, 20, 35);
      
      // Calculate totals
      const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Add summary
      doc.text(`Total Revenue: ₱${totalRevenue.toLocaleString()}`, 20, 50);
      doc.text(`Total Orders: ${totalOrders}`, 20, 60);
      doc.text(`Average Order Value: ₱${averageOrderValue.toFixed(2)}`, 20, 70);
      
      // Add table headers
      doc.text('Date', 20, 90);
      doc.text('Revenue', 70, 90);
      doc.text('Orders', 120, 90);
      doc.text('Avg Order Value', 160, 90);
      
      // Add line under headers
      doc.line(20, 95, 190, 95);
      
      // Add data rows
      let yPosition = 105;
      salesData.forEach((item) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const avgValue = item.orders > 0 ? item.revenue / item.orders : 0;
        
        doc.text(format(new Date(item.date), 'MMM dd'), 20, yPosition);
        doc.text(`₱${item.revenue.toLocaleString()}`, 70, yPosition);
        doc.text(item.orders.toString(), 120, yPosition);
        doc.text(`₱${avgValue.toFixed(2)}`, 160, yPosition);
        
        yPosition += 10;
      });
      
      // Save the PDF
      doc.save(`sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('Sales report downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  if (isLoading) {
    return <div>Loading sales data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sales Analytics</h3>
        <Button 
          onClick={generateSalesPDF}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          Download PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Daily Revenue (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Daily Orders (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
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
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
