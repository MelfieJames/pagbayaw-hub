import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, User, MapPin, Phone, Mail } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
}

interface PurchaseData {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
  transaction_details?: TransactionDetails | null;
  user_email?: string;
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
  const queryClient = useQueryClient();

  const updatePurchaseStatus = useMutation({
    mutationFn: async ({ purchaseId, newStatus }: { purchaseId: number; newStatus: string }) => {
      const { error } = await supabase
        .from("purchases")
        .update({ status: newStatus })
        .eq("id", purchaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchases"] });
      setSelectedPurchase(null);
    },
  });

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      // First get purchases with user email and purchase items
      const { data, error } = await supabase
        .from("purchases")
        .select(
          `
          *,
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
      
      // Now get user emails associated with purchases
      const purchasesWithEmail = await Promise.all(
        data.map(async (purchase) => {
          // Fetch transaction details for this purchase
          const { data: transactionData, error: transactionError } = await supabase
            .from("transaction_details")
            .select("*")
            .eq("purchase_id", purchase.id)
            .maybeSingle();
            
          if (transactionError) {
            console.error("Error fetching transaction details:", transactionError);
          }
          
          // If no transaction details, try to get email from auth users
          let userEmail = null;
          if (!transactionData) {
            const { data: userData, error: userError } = await supabase.auth.admin
              .getUserById(purchase.user_id);
              
            if (!userError && userData) {
              userEmail = userData.user.email;
            }
          }
          
          return {
            ...purchase,
            transaction_details: transactionData || null,
            user_email: userEmail
          };
        })
      );

      return purchasesWithEmail as PurchaseData[];
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

    // Search by customer name from transaction details
    if (
      purchase.transaction_details &&
      `${purchase.transaction_details.first_name} ${purchase.transaction_details.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
      return true;

    // Search by email from transaction details or user email
    if (
      (purchase.transaction_details && 
        purchase.transaction_details.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.user_email && 
        purchase.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl">Customer Orders</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    placeholder="Search orders by ID, customer name, email, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base w-[300px]"
                  />
                </div>
                <Button 
                  className="h-12 px-6" 
                  variant="default"
                  onClick={() => {
                    // Trigger search - currently instant search is implemented
                    // This button is for visual feedback
                  }}
                >
                  Search
                </Button>
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
                      {purchase.transaction_details ? (
                        <div className="max-w-[200px] truncate">
                          {purchase.transaction_details.first_name} {purchase.transaction_details.last_name}
                        </div>
                      ) : (
                        <span className="text-gray-400">{purchase.user_email || "Unknown"}</span>
                      )}
                    </TableCell>
                    <TableCell>{calculateTotalItems(purchase)}</TableCell>
                    <TableCell className="font-medium">
                      ₱{Number(purchase.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={purchase.status}
                        onValueChange={(newStatus) => {
                          updatePurchaseStatus.mutate({
                            purchaseId: purchase.id,
                            newStatus
                          });
                        }}
                      >
                        <SelectTrigger className={
                          purchase.status === "completed"
                            ? "w-32 bg-green-500 text-white border-0 hover:bg-green-600"
                            : purchase.status === "pending"
                            ? "w-32 bg-amber-500 text-white border-0 hover:bg-amber-600"
                            : purchase.status === "processing"
                            ? "w-32 bg-blue-500 text-white border-0 hover:bg-blue-600"
                            : "w-32 bg-red-500 text-white border-0 hover:bg-red-600"
                        }>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
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
                {selectedPurchase.transaction_details ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-500">Name:</div>
                      <div>
                        {selectedPurchase.transaction_details.first_name}{" "}
                        {selectedPurchase.transaction_details.last_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Email:</div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {selectedPurchase.transaction_details.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Phone:</div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-500" />
                        {selectedPurchase.transaction_details.phone_number}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    {selectedPurchase.user_email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {selectedPurchase.user_email}
                      </div>
                    ) : (
                      "No customer information available"
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" /> Delivery Address
                </h3>
                {selectedPurchase.transaction_details?.address ? (
                  <div>
                    <div className="text-sm break-words">
                      {selectedPurchase.transaction_details.address}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Contact: </span>
                      {selectedPurchase.transaction_details.phone_number}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No address information available</div>
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
            <div className="mt-4">
              <div className="flex items-center justify-between">
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
              </div>
              
              {/* Status Update Buttons */}
              <div className="mt-4 flex gap-2">
                {selectedPurchase.status !== "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePurchaseStatus.mutate({ 
                      purchaseId: selectedPurchase.id, 
                      newStatus: "pending" 
                    })}
                    disabled={updatePurchaseStatus.isPending}
                  >
                    Set as Pending
                  </Button>
                )}
                {selectedPurchase.status !== "processing" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePurchaseStatus.mutate({ 
                      purchaseId: selectedPurchase.id, 
                      newStatus: "processing" 
                    })}
                    disabled={updatePurchaseStatus.isPending}
                  >
                    Set as Processing
                  </Button>
                )}
                {selectedPurchase.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePurchaseStatus.mutate({ 
                      purchaseId: selectedPurchase.id, 
                      newStatus: "completed" 
                    })}
                    disabled={updatePurchaseStatus.isPending}
                  >
                    Set as Completed
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
