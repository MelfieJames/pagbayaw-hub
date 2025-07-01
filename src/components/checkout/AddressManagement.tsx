
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AddressModal } from "./AddressModal";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  User, 
  Phone, 
  MapPin,
  Check 
} from "lucide-react";

interface AddressManagementProps {
  selectedAddress?: any;
  onAddressSelect: (address: any) => void;
  selectedAddressId?: number | null;
  showSelectionUI?: boolean;
}

export default function AddressManagement({ 
  selectedAddress, 
  onAddressSelect, 
  selectedAddressId,
  showSelectionUI = false 
}: AddressManagementProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['user-addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: number) => {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Address deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (error) => {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    },
  });

  const handleAddNew = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleDelete = (addressId: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  const handleAddressSelect = (address: any) => {
    onAddressSelect(address);
    setModalOpen(false);
  };

  // Determine which address is currently selected
  const getSelectedAddress = () => {
    if (selectedAddress) return selectedAddress;
    if (selectedAddressId) {
      return addresses.find(addr => addr.id === selectedAddressId);
    }
    return null;
  };

  const currentSelectedAddress = getSelectedAddress();

  if (isLoading) {
    return (
      <Card className="border-amber-200">
        <CardContent className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="bg-amber-50">
        <CardTitle className="text-amber-800 flex items-center gap-2">
          <Home className="h-5 w-5" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No addresses saved yet</p>
            <Button onClick={handleAddNew} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Select a delivery address or add a new one
              </p>
              <Button 
                onClick={handleAddNew}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-800 hover:bg-amber-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
            
            <div className="grid gap-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    currentSelectedAddress?.id === address.id
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                      : 'border-amber-200 hover:border-amber-300 hover:bg-amber-25'
                  }`}
                  onClick={() => onAddressSelect(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-amber-800">
                          {address.address_name}
                        </span>
                        {address.is_default && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            Default
                          </Badge>
                        )}
                        {currentSelectedAddress?.id === address.id && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{address.recipient_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                            {address.purok && `, Purok ${address.purok}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {address.barangay}, {address.city}, {address.state_province} {address.postal_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{address.phone_number}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(address);
                        }}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AddressModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onAddressSelect={handleAddressSelect}
          editingAddress={editingAddress}
        />
      </CardContent>
    </Card>
  );
}
