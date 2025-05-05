
import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { OrderApproval } from "@/components/admin/OrderApproval";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrderApprovalPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all pending orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          profiles(first_name, last_name, email),
          transaction_details(first_name, last_name, email, phone_number, address),
          purchase_items(
            quantity, 
            price_at_time,
            product_id,
            products(product_name, image)
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
  });

  const approveOrder = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast.success("Order approved successfully");
      refetch();
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error("Failed to approve order");
    }
  };

  const rejectOrder = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'rejected' })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast.success("Order rejected");
      refetch();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error("Failed to reject order");
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      (order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       String(order.id).includes(searchTerm));
       
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold text-[#8B7355]">Order Management</h2>
        <p className="text-gray-600 mb-6">View and manage all customer orders</p>
        
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by order ID or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="bg-[#F5F5DC] p-4 border-b">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-medium">Order #{order.id}</h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <span className="font-semibold text-[#8B7355]">
                        ₱{parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <p>
                        {order.transaction_details?.first_name} {order.transaction_details?.last_name || order.profiles?.last_name || ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.transaction_details?.email || order.profiles?.email || order.email}
                      </p>
                      {order.transaction_details?.phone_number && (
                        <p className="text-sm text-gray-500">
                          {order.transaction_details.phone_number}
                        </p>
                      )}
                    </div>
                    
                    {order.transaction_details?.address && (
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-500">
                          {order.transaction_details.address}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.purchase_items && order.purchase_items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 py-2 border-b last:border-0">
                          <img
                            src={item.products?.image || "/placeholder.svg"}
                            alt={item.products?.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.products?.product_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity} × ₱{parseFloat(item.price_at_time).toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium">
                            ₱{(parseFloat(item.price_at_time) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => rejectOrder(order.id)}
                      >
                        Reject Order
                      </Button>
                      <Button 
                        className="bg-[#8B7355] hover:bg-[#7a624d]"
                        onClick={() => approveOrder(order.id)}
                      >
                        Approve Order
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
