
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, ShoppingBag } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PurchaseItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  products: {
    product_name: string;
    image: string;
  };
}

interface Purchase {
  id: string;
  user_id: string;
  total_amount: number;
  created_at: string;
  status: string;
  profiles: {
    email: string;
  };
  purchase_items: PurchaseItem[];
}

export function RecentPurchases() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['admin-purchases', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('purchases')
        .select(`
          *,
          profiles(email),
          purchase_items(
            id,
            product_id,
            quantity,
            price_at_time,
            products(product_name, image)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        // Add a day to include the end date
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader>
        <CardTitle className="text-[#8B7355] flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Recent Purchases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">From:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">To:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length > 0 ? (
                  purchases.map((purchase: Purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>#{purchase.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#8B7355] text-white">
                              {purchase.profiles?.email.substring(0, 2).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{purchase.profiles?.email || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(purchase.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(purchase.total_amount))}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(purchase.status)}>
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(purchase)}
                          className="h-8"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No purchases found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Order ID</p>
                  <p>#{selectedPurchase.id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{new Date(selectedPurchase.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">User</p>
                  <p>{selectedPurchase.profiles?.email || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={getStatusBadgeColor(selectedPurchase.status)}>
                    {selectedPurchase.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Items</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPurchase.purchase_items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                                <img 
                                  src={item.products?.image || "/placeholder.svg"} 
                                  alt={item.products?.product_name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span>{item.products?.product_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(Number(item.price_at_time))}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(item.price_at_time) * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold">
                    Total: {formatCurrency(Number(selectedPurchase.total_amount))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
