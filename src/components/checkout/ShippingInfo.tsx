
import { Button } from "@/components/ui/button";
import { ProfileData } from "@/hooks/useProfile";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ShippingInfoProps {
  profileData: ProfileData;
  isComplete: boolean;
}

// This component has been deprecated and replaced by AddressManagement
export default function ShippingInfo({ profileData, isComplete }: ShippingInfoProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <User className="h-5 w-5 text-primary" /> Address Management
      </h2>
      
      <div className="text-center py-4">
        <p className="text-gray-600 mb-3">Please use the Address Management section to manage your shipping addresses</p>
        <Button 
          onClick={() => navigate('/profile', { state: { redirectAfterUpdate: '/checkout' }})}
          className="bg-primary hover:bg-primary/90"
        >
          Manage Addresses
        </Button>
      </div>
    </div>
  );
}
