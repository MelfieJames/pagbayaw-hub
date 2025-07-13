import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, Phone, MapPin, Home, Building, Mail } from "lucide-react";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect: (address: any) => void;
  editingAddress?: any;
}

export function AddressModal({ 
  open, 
  onOpenChange, 
  onAddressSelect, 
  editingAddress 
}: AddressModalProps) {
  const { user } = useAuth();
  const { profileData } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
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

  // Check if profile has required data for recipient name
  const hasProfileData = !!(
    (profileData.first_name && profileData.first_name.trim()) &&
    (profileData.last_name && profileData.last_name.trim())
  );

  // Auto-fill recipient name from profile when creating new address
  useEffect(() => {
    if (open && !editingAddress) {
      if (!hasProfileData) {
        toast.error("Please complete your profile first to add delivery addresses");
        onOpenChange(false);
        navigate('/profile');
        return;
      }
      
      const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        recipient_name: fullName,
        phone_number: profileData.phone_number || '',
      }));
    }
  }, [open, editingAddress, profileData, hasProfileData, onOpenChange, navigate]);

  // Always sync recipient_name to profile full name, even when editing
  useEffect(() => {
    if (!hasProfileData) return;
      const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
    setFormData(prev => ({
      ...prev,
        recipient_name: fullName,
      phone_number: prev.phone_number || profileData.phone_number || '',
    }));
  }, [profileData, open, editingAddress, hasProfileData]);

  const saveAddressMutation = useMutation({
    mutationFn: async (addressData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (editingAddress) {
        const { data, error } = await supabase
          .from('user_addresses')
          .update(addressData)
          .eq('id', editingAddress.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('user_addresses')
          .insert({ ...addressData, user_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      onAddressSelect(data);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for required fields
    const requiredFields = [
      { field: 'address_name', label: 'Address Name' },
      { field: 'address_line1', label: 'Address Line 1' },
      { field: 'purok', label: 'Purok Details' },
      { field: 'barangay', label: 'Barangay' },
      { field: 'city', label: 'City' },
      { field: 'state_province', label: 'Province' },
      { field: 'postal_code', label: 'Postal Code' },
      { field: 'phone_number', label: 'Phone Number' },
    ];
    
    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        toast.error(`Please fill in ${label}`);
        return;
      }
    }

    saveAddressMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-6 w-6 text-amber-600" />
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogDescription>
            {editingAddress ? 'Update your delivery address' : 'Add a new delivery address'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Address Name and Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_name" className="flex items-center gap-2">
                <Home className="h-4 w-4 text-amber-600" />
                Address Name *
              </Label>
              <Input
                id="address_name"
                value={formData.address_name}
                onChange={(e) => handleInputChange('address_name', e.target.value)}
                placeholder="e.g., Home, Work, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-amber-600" />
                Recipient Name *
              </Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                readOnly
                className="bg-gray-100"
                placeholder="Recipient name"
              />
              <p className="text-xs text-gray-500">
                This will always match your profile name and cannot be changed.
              </p>
            </div>
          </div>

          {/* Row 2: Address Lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                Address Line 1 *
              </Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                placeholder="Street address, building, house number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line2" className="flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-600" />
                Address Line 2
              </Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => handleInputChange('address_line2', e.target.value)}
                placeholder="Apartment, suite, unit, etc. (optional)"
              />
            </div>
          </div>

          {/* Row 3: Purok and Barangay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purok" className="flex items-center gap-2">
                <Home className="h-4 w-4 text-amber-600" />
                Purok Details *
              </Label>
              <Input
                id="purok"
                value={formData.purok}
                onChange={(e) => handleInputChange('purok', e.target.value)}
                placeholder="Purok details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barangay" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                Barangay *
              </Label>
              <Input
                id="barangay"
                value={formData.barangay}
                onChange={(e) => handleInputChange('barangay', e.target.value)}
                placeholder="Barangay"
              />
            </div>
          </div>

          {/* Row 4: City and Province */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-600" />
                City *
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state_province" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                Province *
              </Label>
              <Input
                id="state_province"
                value={formData.state_province}
                onChange={(e) => handleInputChange('state_province', e.target.value)}
                placeholder="Province"
              />
            </div>
          </div>

          {/* Row 5: Postal Code and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-600" />
                Postal Code *
              </Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="Postal Code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                Country
              </Label>
              <Input
                id="country"
                value={formData.country}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">
                Currently only available in the Philippines
              </p>
            </div>
          </div>

          {/* Row 6: Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-600" />
              Phone Number *
            </Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => handleInputChange('is_default', checked)}
            />
            <Label htmlFor="is_default">Set as default address</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveAddressMutation.isPending}
              className="flex-1"
            >
              {saveAddressMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                editingAddress ? 'Update Address' : 'Add Address'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
