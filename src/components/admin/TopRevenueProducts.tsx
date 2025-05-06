
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Search, TrendingUp, Package } from "lucide-react";

interface RevenueProduct {
  product_id: number;
  product_name: string;
  total_revenue: number;
  units_sold: number;
}

export function TopRevenueProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: revenueProducts, isLoading } = useQuery({
    queryKey: ["top-revenue-products"],
    queryFn: async () => {
      // First, get all the completed purchases
      const { data: completedPurchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('id')
        .eq('status', 'completed')
        .neq('status', 'cancelled');
      
      if (purchasesError) throw purchasesError;
      
      if (!completedPurchases || completedPurchases.length === 0) {
        return [];
      }
      
      const purchaseIds = completedPurchases.map(p => p.id);
      
      // Get purchase items for completed purchases with product details
      const { data: purchaseItems, error: itemsError } = await supabase
        .from('purchase_items')
        .select(`
          quantity,
          price_at_time,
          product_id,
          products (
            product_name
          )
        `)
        .in('purchase_id', purchaseIds);
      
      if (itemsError) throw itemsError;
      
      if (!purchaseItems || purchaseItems.length === 0) {
        return [];
      }
      
      // Calculate revenue per product
      const productRevenue: Record<string, RevenueProduct> = {};
      
      purchaseItems.forEach(item => {
        const productId = item.product_id?.toString() || '';
        const productName = item.products?.product_name || 'Unknown Product';
        const revenue = Number(item.price_at_time || 0) * Number(item.quantity || 0);
        
        if (!productRevenue[productId]) {
          productRevenue[productId] = {
            product_id: Number(productId),
            product_name: productName,
            total_revenue: 0,
            units_sold: 0
          };
        }
        
        productRevenue[productId].total_revenue += revenue;
        productRevenue[productId].units_sold += Number(item.quantity || 0);
      });
      
      return Object.values(productRevenue)
        .sort((a, b) => b.total_revenue - a.total_revenue);
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const filteredProducts = revenueProducts?.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const topProducts = searchTerm 
    ? filteredProducts 
    : filteredProducts.slice(0, 5);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#8B7355]" />
            Top Revenue Products
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-[#C4A484] w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : topProducts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5DC]/50">
                <TableHead className="text-[#8B7355]">Rank</TableHead>
                <TableHead className="text-[#8B7355]">Product</TableHead>
                <TableHead className="text-[#8B7355] text-right">Units Sold</TableHead>
                <TableHead className="text-[#8B7355] text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product, index) => (
                <TableRow key={product.product_id} className="border-b border-[#E5E2DD]">
                  <TableCell className="font-medium">
                    {searchTerm ? "—" : `#${index + 1}`}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#8B7355]" />
                    {product.product_name}
                  </TableCell>
                  <TableCell className="text-right">{product.units_sold}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.total_revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No products match your search" : "No revenue data available yet"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
