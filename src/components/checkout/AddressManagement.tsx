import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit2, Trash2, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddressType {
  id: number;
  user_id: string;
  address_name: string;
  recipient_name: string;
  address_line1: string;
  address_line2: string | null;
  purok: string | null;
  barangay: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  created_at: string;
}

interface AddressFormData {
  address_name: string;
  address_line1: string;
  address_line2: string;
  purok: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
}

interface AddressManagementProps {
  onAddressSelect?: (address: AddressType) => void;
  selectedAddressId?: number | null;
  showSelectionUI?: boolean;
}

export default function AddressManagement({ 
  onAddressSelect, 
  selectedAddressId,
  showSelectionUI = false 
}: AddressManagementProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<AddressType | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    address_name: "",
    address_line1: "",
    address_line2: "",
    purok: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Philippines",
    phone_number: "",
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchAddresses();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load your saved addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserFullName = () => {
    if (!userProfile) return user?.email?.split('@')[0] || 'User';
    const firstName = userProfile.first_name || '';
    const middleName = userProfile.middle_name || '';
    const lastName = userProfile.last_name || '';
    return `${firstName} ${middleName} ${lastName}`.trim() || user?.email?.split('@')[0] || 'User';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // If this is the first address or marked as default, update other addresses
      if (formData.is_default && addresses.some(addr => addr.is_default)) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      // If this is the first address, make it default
      const isFirstAddress = addresses.length === 0;

      const { data, error } = await supabase
        .from('user_addresses')
        .insert([
          {
            user_id: user.id,
            address_name: formData.address_name,
            recipient_name: getUserFullName(),
            address_line1: formData.address_line1,
            address_line2: formData.address_line2,
            purok: formData.purok,
            barangay: formData.barangay,
            city: formData.city,
            state_province: formData.province,
            postal_code: formData.postal_code,
            country: formData.country,
            phone_number: formData.phone_number,
            is_default: isFirstAddress || formData.is_default
          }
        ])
        .select();

      if (error) throw error;
      
      toast.success('Address added successfully');
      setIsAddAddressModalOpen(false);
      fetchAddresses();
      
      // Reset form data
      setFormData({
        address_name: "",
        address_line1: "",
        address_line2: "",
        purok: "",
        barangay: "",
        city: "",
        province: "",
        postal_code: "",
        country: "Philippines",
        phone_number: "",
        is_default: false
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const handleEditAddress = (address: AddressType) => {
    setCurrentAddress(address);
    setFormData({
      address_name: address.address_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      purok: address.purok || "",
      barangay: address.barangay || "",
      city: address.city,
      province: address.state_province,
      postal_code: address.postal_code,
      country: address.country,
      phone_number: address.phone_number,
      is_default: address.is_default
    });
    setIsEditAddressModalOpen(true);
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentAddress) return;

    try {
      // If making this address default, update other addresses
      if (formData.is_default && !currentAddress.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { error } = await supabase
        .from('user_addresses')
        .update({
          address_name: formData.address_name,
          recipient_name: getUserFullName(),
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          purok: formData.purok,
          barangay: formData.barangay,
          city: formData.city,
          state_province: formData.province,
          postal_code: formData.postal_code,
          country: formData.country,
          phone_number: formData.phone_number,
          is_default: formData.is_default
        })
        .eq('id', currentAddress.id);

      if (error) throw error;
      
      toast.success('Address updated successfully');
      setIsEditAddressModalOpen(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!user) return;

    try {
      // Check if this is the default address
      const addressToDelete = addresses.find(addr => addr.id === id);
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Address deleted successfully');
      
      // If we deleted the default address and have other addresses, make another one default
      if (addressToDelete?.is_default && addresses.length > 1) {
        const newDefaultAddress = addresses.find(addr => addr.id !== id);
        if (newDefaultAddress) {
          await supabase
            .from('user_addresses')
            .update({ is_default: true })
            .eq('id', newDefaultAddress.id);
        }
      }
      
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSelectAddress = (address: AddressType) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  const handleSetDefault = async (id: number) => {
    if (!user) return;

    try {
      // Set all addresses to non-default
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Set the selected address as default
      await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id);
      
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Addresses</h2>
        <Button onClick={() => setIsAddAddressModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="bg-gray-50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-center mb-4">You don't have any saved addresses yet</p>
            <Button onClick={() => setIsAddAddressModalOpen(true)}>Add Your First Address</Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card 
                key={address.id} 
                className={`overflow-hidden ${
                  selectedAddressId === address.id ? "border-2 border-primary" : ""
                }`}
              >
                <CardHeader className="bg-gray-50 py-3 px-4 flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {address.address_name}
                    {address.is_default && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="font-medium">{address.recipient_name}</p>
                  <p className="text-sm text-gray-500">{address.address_line1}</p>
                  {address.address_line2 && (
                    <p className="text-sm text-gray-500">{address.address_line2}</p>
                  )}
                  {address.purok && (
                    <p className="text-sm text-gray-500">Purok {address.purok}</p>
                  )}
                  {address.barangay && (
                    <p className="text-sm text-gray-500">Barangay {address.barangay}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {address.city}, {address.state_province}, {address.postal_code}
                  </p>
                  <p className="text-sm text-gray-500">{address.country}</p>
                  <p className="text-sm text-gray-500 pt-2">{address.phone_number}</p>
                </CardContent>
                {showSelectionUI && (
                  <CardFooter className="flex justify-between px-4 py-3 bg-gray-50 border-t">
                    {!address.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={() => handleSelectAddress(address)}
                      className={selectedAddressId === address.id ? "bg-green-600" : ""}
                    >
                      {selectedAddressId === address.id ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        "Use This Address"
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Add Address Modal */}
      <Dialog open={isAddAddressModalOpen} onOpenChange={setIsAddAddressModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Enter the details for your new delivery address. Your name will be used from your profile.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={handleAddAddress} className="py-4 px-1">
              <div className="space-y-2 mb-4">
                <Label htmlFor="recipient_display">Recipient Name</Label>
                <Input
                  id="recipient_display"
                  value={getUserFullName()}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Name is taken from your profile. Update your profile to change this.</p>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="address_name">Address Name (e.g. Home, Office)</Label>
                <Input
                  id="address_name"
                  name="address_name"
                  value={formData.address_name}
                  onChange={handleInputChange}
                  placeholder="Home"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line1">Street Address</Label>
                  <Input
                    id="address_line1"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    placeholder="Street address, P.O. box"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address_line2"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="purok">Purok (Optional)</Label>
                  <Input
                    id="purok"
                    name="purok"
                    value={formData.purok}
                    onChange={handleInputChange}
                    placeholder="Purok number or name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Input
                    id="barangay"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    placeholder="Barangay name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City or Municipality"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Province"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Phone number for delivery questions"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_default">Set as default address</Label>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddAddressModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Address</Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal - similar structure but for editing */}
      <Dialog open={isEditAddressModalOpen} onOpenChange={setIsEditAddressModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your delivery address information. Your name will be used from your profile.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={handleUpdateAddress} className="py-4 px-1">
              <div className="space-y-2 mb-4">
                <Label htmlFor="edit_recipient_display">Recipient Name</Label>
                <Input
                  id="edit_recipient_display"
                  value={getUserFullName()}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Name is taken from your profile. Update your profile to change this.</p>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="edit_address_name">Address Name</Label>
                <Input
                  id="edit_address_name"
                  name="address_name"
                  value={formData.address_name}
                  onChange={handleInputChange}
                  placeholder="Home"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_address_line1">Street Address</Label>
                  <Input
                    id="edit_address_line1"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    placeholder="Street address, P.O. box"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_address_line2">Address Line 2 (Optional)</Label>
                  <Input
                    id="edit_address_line2"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_purok">Purok (Optional)</Label>
                  <Input
                    id="edit_purok"
                    name="purok"
                    value={formData.purok}
                    onChange={handleInputChange}
                    placeholder="Purok number or name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_barangay">Barangay</Label>
                  <Input
                    id="edit_barangay"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    placeholder="Barangay name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_city">City/Municipality</Label>
                  <Input
                    id="edit_city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City or Municipality"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_province">Province</Label>
                  <Input
                    id="edit_province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Province"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_postal_code">Postal Code</Label>
                  <Input
                    id="edit_postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_country">Country</Label>
                  <Input
                    id="edit_country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_phone_number">Phone Number</Label>
                  <Input
                    id="edit_phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Phone number for delivery questions"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="edit_is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit_is_default">Set as default address</Label>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditAddressModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Address</Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
