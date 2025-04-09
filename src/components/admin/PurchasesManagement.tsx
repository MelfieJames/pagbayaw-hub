
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Calendar, User, MapPin, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchaseData {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    location: string;
  };
  purchase_items: {
    id: number;
    quantity: number;
    price_at_time: number;
    product_id: number;
    products: {
      product_name: string;
      image: string | null;
    };
  }[];
}

export function PurchasesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseData | null>(null);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(
          `
          *,
          profiles (first_name, last_name, email, phone_number, location),
          purchase_items (
            id,
            quantity,
            price_at_time,
            product_id,
            products (product_name, image)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PurchaseData[];
    },
  });

  const filteredPurchases = purchases.filter((purchase) => {
    // Filter by status
    if (statusFilter !== "all" && purchase.status !== statusFilter) {
      return false;
    }

    // Filter by search term
    if (!searchTerm) return true;

    // Search by purchase ID
    if (purchase.id.toString().includes(searchTerm)) return true;

    // Search by customer name
    if (
      purchase.profiles &&
      `${purchase.profiles.first_name} ${purchase.profiles.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
      return true;

    // Search by email
    if (
      purchase.profiles &&
      purchase.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return true;

    // Search by product name
    return purchase.purchase_items?.some((item) =>
      item.products?.product_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const viewPurchaseDetails = (purchase: PurchaseData) => {
    setSelectedPurchase(purchase);
  };

  const calculateTotalItems = (purchase: PurchaseData) => {
    return purchase.purchase_items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl">Customer Orders</CardTitle>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{purchase.id}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(purchase.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {purchase.profiles ? (
                        <div className="max-w-[200px] truncate">
                          {purchase.profiles.first_name} {purchase.profiles.last_name}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>{calculateTotalItems(purchase)}</TableCell>
                    <TableCell className="font-medium">
                      ₱{Number(purchase.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          purchase.status === "completed"
                            ? "bg-green-500"
                            : purchase.status === "pending"
                            ? "bg-amber-500"
                            : purchase.status === "processing"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewPurchaseDetails(purchase)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Purchase Details Modal */}
      <Dialog
        open={!!selectedPurchase}
        onOpenChange={(open) => !open && setSelectedPurchase(null)}
      >
        {selectedPurchase && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Order #{selectedPurchase.id}
              </DialogTitle>
              <DialogDescription>
                Placed on{" "}
                {format(
                  new Date(selectedPurchase.created_at),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" /> Customer Information
                </h3>
                {selectedPurchase.profiles ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-500">Name:</div>
                      <div>
                        {selectedPurchase.profiles.first_name}{" "}
                        {selectedPurchase.profiles.last_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Email:</div>
                      <div>{selectedPurchase.profiles.email}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Phone:</div>
                      <div>{selectedPurchase.profiles.phone_number}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No customer information</div>
                )}
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" /> Delivery Address
                </h3>
                {selectedPurchase.profiles?.location ? (
                  <div>
                    <div className="text-sm break-words">
                      {selectedPurchase.profiles.location}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Contact: </span>
                      {selectedPurchase.profiles.phone_number}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No address information</div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-4">
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.purchase_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.products?.image || "/placeholder.svg"}
                              alt={item.products?.product_name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>{item.products?.product_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>₱{Number(item.price_at_time).toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right">
                        ₱{Number(selectedPurchase.total_amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Shipping
                      </TableCell>
                      <TableCell className="text-right text-green-600">Free</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₱{Number(selectedPurchase.total_amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Order Status */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500 mr-2">Order Status:</span>
                <Badge
                  className={
                    selectedPurchase.status === "completed"
                      ? "bg-green-500"
                      : selectedPurchase.status === "pending"
                      ? "bg-amber-500"
                      : selectedPurchase.status === "processing"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }
                >
                  {selectedPurchase.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(
                  new Date(selectedPurchase.created_at),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
