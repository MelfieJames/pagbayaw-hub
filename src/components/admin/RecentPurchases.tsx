import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Calendar, ShoppingBag, FileText, User } from "lucide-react";
import { TransactionDetailsRow } from "@/types/supabase";

export function RecentPurchases() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch all purchases with related data, now using admin RLS policies
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['admin-purchases-detailed'],
    queryFn: async () => {
      try {
        // Get all purchases with their related items and products
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            purchase_items(
              *,
              products(*)
            ),
            transaction_details(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching purchases:", error);
          throw error;
        }
        
        console.log("Fetched purchases with transaction details:", data);
        
        // Process purchases to include customer details
        const purchasesWithDetails = data.map(purchase => {
          const transactionDetails: TransactionDetailsRow = purchase.transaction_details?.length > 0 
            ? purchase.transaction_details[0]
            : null;
            
          // If we have transaction details, use those
          if (transactionDetails) {
            return {
              ...purchase,
              customer_name: `${transactionDetails.first_name} ${transactionDetails.last_name}`,
              customer_email: transactionDetails.email,
              customer_phone: transactionDetails.phone_number,
              customer_address: transactionDetails.address
            };
          }
          
          // Otherwise, return purchase as is
          return purchase;
        });
        
        return purchasesWithDetails || [];
      } catch (error) {
        console.error("Error in admin purchases query:", error);
        throw error;
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Filter purchases based on search term and date
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      searchTerm === "" || 
      purchase.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.customer_email && purchase.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.customer_name && purchase.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = 
      dateFilter === "" || 
      format(new Date(purchase.created_at), 'yyyy-MM-dd').includes(dateFilter);

    return matchesSearch && matchesDate;
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const getBadgeColor = (status: string) => {
    switch (status?.toLowerCase() || 'pending') {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Recent Purchases
          </CardTitle>
          <Badge variant="outline" className="px-3 py-1 bg-white">
            Total: {purchases.length} orders
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by ID, status, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No purchases found
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[80px]">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      ID
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-400" />
                      Customer
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4 text-gray-400" />
                      Items
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{purchase.id}</TableCell>
                    <TableCell>
                      {purchase.customer_name || "Anonymous"}
                      {purchase.customer_email && (
                        <div className="text-xs text-gray-500 mt-1">{purchase.customer_email}</div>
                      )}
                      {purchase.customer_phone && (
                        <div className="text-xs text-gray-500">{purchase.customer_phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {purchase.purchase_items?.length || 0} items
                      <div className="text-xs text-gray-500 mt-1">
                        {purchase.purchase_items?.map((item) => (
                          <div key={item.id} className="truncate max-w-[200px]">
                            {item.products?.product_name} x{item.quantity}
                          </div>
                        )).slice(0, 2)}
                        {(purchase.purchase_items?.length || 0) > 2 && (
                          <div>+ {(purchase.purchase_items?.length || 0) - 2} more</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(purchase.created_at), 'MMM d, yyyy')}
                      <div className="text-xs text-gray-500">
                        {format(new Date(purchase.created_at), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(parseFloat(purchase.total_amount))}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getBadgeColor(purchase.status)}`}>
                        {purchase.status || 'pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
