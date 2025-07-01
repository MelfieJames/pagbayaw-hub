
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  Home, 
  User, 
  MapPin, 
  Phone, 
  Building, 
  Navigation,
  Flag,
  Mail,
  Plus,
  Save
} from "lucide-react";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect?: (address: any) => void;
  editingAddress?: any;
}

export function AddressModal({ open, onOpenChange, onAddressSelect, editingAddress }: AddressModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    address_name: editingAddress?.address_name || '',
    recipient_name: editingAddress?.recipient_name || '',
    address_line1: editingAddress?.address_line1 || '',
    address_line2: editingAddress?.address_line2 || '',
    purok: editingAddress?.purok || '',
    barangay: editingAddress?.barangay || '',
    city: editingAddress?.city || '',
    state_province: editingAddress?.state_province || '',
    postal_code: editingAddress?.postal_code || '',
    country: editingAddress?.country || 'Philippines',
    phone_number: editingAddress?.phone_number || '',
    is_default: editingAddress?.is_default || false,
  });

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

  const addAddressMutation = useMutation({
    mutationFn: async (addressData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_addresses')
        .insert([{ ...addressData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newAddress) => {
      toast.success('Address added successfully');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      if (onAddressSelect) {
        onAddressSelect(newAddress);
      }
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error adding address:', error);
      toast.error('Failed to add address. Please try again.');
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (addressData: any) => {
      if (!editingAddress?.id) throw new Error('No address to update');
      
      const { data, error } = await supabase
        .from('user_addresses')
        .update(addressData)
        .eq('id', editingAddress.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedAddress) => {
      toast.success('Address updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      if (onAddressSelect) {
        onAddressSelect(updatedAddress);
      }
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating address:', error);
      toast.error('Failed to update address. Please try again.');
    },
  });

  const resetForm = () => {
    setFormData({
      address_name: '',
      recipient_name: '',
      address_line1: '',
      address_line2: '',
      purok: '',
      barangay: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'Philippines',
      phone_number: '',
      is_default: false,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = [
      'address_name', 'recipient_name', 'address_line1', 
      'barangay', 'city', 'state_province', 'postal_code', 
      'country', 'phone_number'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingAddress) {
      updateAddressMutation.mutate(formData);
    } else {
      addAddressMutation.mutate(formData);
    }
  };

  const handleSelectExistingAddress = (address: any) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800">
            <Home className="h-5 w-5" />
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>

        {!editingAddress && addresses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-amber-800">Select Existing Address</h3>
            <div className="grid gap-3 max-h-40 overflow-y-auto">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-3 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => handleSelectExistingAddress(address)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">{address.address_name}</span>
                      {address.is_default && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.recipient_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.address_line1}, {address.barangay}, {address.city}
                  </p>
                </div>
              ))}
            </div>
            <div className="my-4 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-sm text-gray-500">or add new address</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Name and Recipient Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_name" className="flex items-center gap-2 text-amber-800 font-medium">
                <Home className="h-4 w-4" />
                Address Name *
              </Label>
              <Input
                id="address_name"
                value={formData.address_name}
                onChange={(e) => handleInputChange('address_name', e.target.value)}
                placeholder="e.g., Home, Office, etc."
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient_name" className="flex items-center gap-2 text-amber-800 font-medium">
                <User className="h-4 w-4" />
                Recipient Name *
              </Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                placeholder="Full name of recipient"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
          </div>

          {/* Address Lines */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1" className="flex items-center gap-2 text-amber-800 font-medium">
                <MapPin className="h-4 w-4" />
                Street Address *
              </Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                placeholder="House number, street name"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line2" className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                Address Line 2 (Optional)
              </Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => handleInputChange('address_line2', e.target.value)}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
              />
            </div>
          </div>

          {/* Purok and Barangay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purok" className="flex items-center gap-2 text-gray-600">
                <Navigation className="h-4 w-4" />
                Purok (Optional)
              </Label>
              <Input
                id="purok"
                value={formData.purok}
                onChange={(e) => handleInputChange('purok', e.target.value)}
                placeholder="Purok number or name"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barangay" className="flex items-center gap-2 text-amber-800 font-medium">
                <MapPin className="h-4 w-4" />
                Barangay *
              </Label>
              <Input
                id="barangay"
                value={formData.barangay}
                onChange={(e) => handleInputChange('barangay', e.target.value)}
                placeholder="Barangay name"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
          </div>

          {/* City and Province */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2 text-amber-800 font-medium">
                <Building className="h-4 w-4" />
                City/Municipality *
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City or municipality"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state_province" className="flex items-center gap-2 text-amber-800 font-medium">
                <MapPin className="h-4 w-4" />
                Province *
              </Label>
              <Input
                id="state_province"
                value={formData.state_province}
                onChange={(e) => handleInputChange('state_province', e.target.value)}
                placeholder="Province"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
          </div>

          {/* Postal Code and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code" className="flex items-center gap-2 text-amber-800 font-medium">
                <Mail className="h-4 w-4" />
                Postal Code *
              </Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="Postal/ZIP code"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2 text-amber-800 font-medium">
                <Flag className="h-4 w-4" />
                Country *
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Country"
                className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="flex items-center gap-2 text-amber-800 font-medium">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="Contact phone number"
              className="border-amber-200 focus:border-amber-600 focus:ring-amber-200"
              required
            />
          </div>

          {/* Default Address Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => handleInputChange('is_default', checked)}
            />
            <Label htmlFor="is_default" className="text-amber-800 font-medium">
              Set as default address
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {(addAddressMutation.isPending || updateAddressMutation.isPending) ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {editingAddress ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
