
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
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { CalendarDays, Calendar, CalendarRange, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimeFilter = "day" | "week" | "month";

export function SalesCharts() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("day");

  const getStartDate = () => {
    const now = new Date();
    switch (timeFilter) {
      case "day":
        return subDays(now, 30);
      case "week":
        return subWeeks(now, 12);
      case "month":
        return subMonths(now, 12);
      default:
        return subDays(now, 30);
    }
  };

  const getGroupFormat = () => {
    switch (timeFilter) {
      case "day":
        return "MMM dd";
      case "week":
        return "'Week' w, yyyy";
      case "month":
        return "MMM yyyy";
      default:
        return "MMM dd";
    }
  };

  const getGroupingFunction = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (timeFilter) {
      case "day":
        return format(date, "MMM dd");
      case "week": {
        const weekStart = startOfWeek(date);
        return format(weekStart, "'Week' w, yyyy");
      }
      case "month":
        return format(date, "MMM yyyy");
      default:
        return format(date, "MMM dd");
    }
  };

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["admin-sales-data", timeFilter],
    queryFn: async () => {
      const startDate = getStartDate();
      
      // Only get completed purchases (explicitly exclude cancelled)
      const { data, error } = await supabase
        .from("purchases")
        .select("id, created_at, total_amount, status")
        .gte("created_at", startDate.toISOString())
        .eq("status", "completed")
        .neq("status", "cancelled")
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      
      // Group by day, week, or month based on the selected filter
      const salesByPeriod = data.reduce((acc: any, curr: any) => {
        const periodKey = getGroupingFunction(curr.created_at);
        
        if (!acc[periodKey]) {
          acc[periodKey] = {
            date: periodKey,
            sales: 0,
            orders: 0,
          };
        }
        acc[periodKey].sales += Number(curr.total_amount);
        acc[periodKey].orders += 1;
        return acc;
      }, {});
      
      return {
        dailySales: Object.values(salesByPeriod),
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
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Overview
          </CardTitle>
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Overview
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={timeFilter === "day" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeFilter("day")}
              className={timeFilter === "day" ? "bg-[#8B7355] hover:bg-[#6b5941]" : "border-[#8B7355] text-[#8B7355]"}
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Daily
            </Button>
            <Button 
              variant={timeFilter === "week" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeFilter("week")}
              className={timeFilter === "week" ? "bg-[#8B7355] hover:bg-[#6b5941]" : "border-[#8B7355] text-[#8B7355]"}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Weekly
            </Button>
            <Button 
              variant={timeFilter === "month" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeFilter("month")}
              className={timeFilter === "month" ? "bg-[#8B7355] hover:bg-[#6b5941]" : "border-[#8B7355] text-[#8B7355]"}
            >
              <CalendarRange className="h-4 w-4 mr-1" />
              Monthly
            </Button>
          </div>
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
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => value}
              />
              <YAxis 
                tickFormatter={(value) => `₱${value}`} 
                domain={[0, 'dataMax + 1000']}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)} 
                labelFormatter={(label) => `Period: ${label}`}
              />
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
