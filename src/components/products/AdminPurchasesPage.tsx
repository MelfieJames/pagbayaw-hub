
import { useState } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, X, Info, Search } from "lucide-react";
import { TransactionDetailsRow } from "@/types/supabase";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Purchase = {
  id: number;
  created_at: string;
  total_amount: string;
  status: string;
  purchase_items: { products: any[] }[];
  transaction_details?: TransactionDetailsRow[];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
};

const AdminPurchasesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: purchases = [], isLoading, error } = useQuery<Purchase[]>({
    queryKey: ["admin-purchases-detailed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id,
          created_at,
          total_amount,
          status,
          purchase_items(*, products(*)),
          transaction_details(first_name, last_name, email, phone_number, address)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((purchase: any) => {
        const transaction: TransactionDetailsRow = purchase.transaction_details?.[0];
        return {
          ...purchase,
          customer_name: transaction ? `${transaction.first_name} ${transaction.last_name}` : "Anonymous",
          customer_email: transaction?.email ?? "N/A",
          customer_phone: transaction?.phone_number ?? "N/A",
          customer_address: transaction?.address ?? "N/A",
        };
      });
    },
    refetchInterval: 30000,
  });

  const viewPurchaseDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] text-red-600">
        Error fetching purchases. Please try again later.
      </div>
    );
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const search = searchTerm.toLowerCase();
    const dateString = format(new Date(purchase.created_at), "yyyy-MM-dd");
    const matchesSearch =
      !search ||
      purchase.id.toString().includes(search) ||
      purchase.status?.toLowerCase().includes(search) ||
      purchase.customer_email?.toLowerCase().includes(search) ||
      purchase.customer_name?.toLowerCase().includes(search);

    const matchesDate = !dateFilter || dateString === dateFilter;
    return matchesSearch && matchesDate;
  });

  const formatCurrency = (value: string) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(parseFloat(value));

  const getBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold text-[#8B7355]">Purchases Management</h2>

        <div className="mt-6 mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by ID, status, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <Card className="border-2 border-[#C4A484]">
          <CardHeader className="bg-[#F5F5DC]">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#8B7355] flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Recent Purchases
              </CardTitle>
              <Badge variant="outline" className="px-3 py-1 bg-white">
                Total: {filteredPurchases.length} orders
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 overflow-x-auto">
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No purchases found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{purchase.id}</TableCell>
                        <TableCell>{purchase.customer_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">{purchase.customer_email}</div>
                          <div className="text-xs text-gray-500">{purchase.customer_phone}</div>
                        </TableCell>
                        <TableCell>{purchase.purchase_items?.length || 0} items</TableCell>
                        <TableCell>
                          {format(new Date(purchase.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(purchase.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getBadgeColor(purchase.status)}>
                            {purchase.status?.charAt(0).toUpperCase() + purchase.status?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-primary"
                            onClick={() => viewPurchaseDetails(purchase)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order #{selectedPurchase?.id}
              </DialogTitle>
            </DialogHeader>

            {selectedPurchase && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <p className="text-sm">Name: {selectedPurchase.customer_name}</p>
                    <p className="text-sm">Email: {selectedPurchase.customer_email}</p>
                    <p className="text-sm">Phone: {selectedPurchase.customer_phone}</p>
                    <p className="text-sm">Address: {selectedPurchase.customer_address}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <h3 className="font-medium mb-2">Order Information</h3>
                    <p className="text-sm">Date: {format(new Date(selectedPurchase.created_at), "PPP")}</p>
                    <p className="text-sm">Status: <span className={`inline-block px-2 py-1 rounded text-xs ${getBadgeColor(selectedPurchase.status)}`}>{selectedPurchase.status}</span></p>
                    <p className="text-sm">Total: {formatCurrency(selectedPurchase.total_amount)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <ScrollArea className="h-[300px] rounded-md border">
                    <div className="p-4">
                      {selectedPurchase.purchase_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                          <img 
                            src={item.products?.image || "/placeholder.svg"}
                            alt={item.products?.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-grow">
                            <p className="font-medium">{item.products?.product_name}</p>
                            <p className="text-sm text-gray-500">
                              ₱{Number(item.price_at_time).toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPurchasesPage;
