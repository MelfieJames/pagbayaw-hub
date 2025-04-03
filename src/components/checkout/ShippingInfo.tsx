
import { Button } from "@/components/ui/button";
import { ProfileData } from "@/hooks/useProfile";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ShippingInfoProps {
  profileData: ProfileData;
  isComplete: boolean;
}

export default function ShippingInfo({ profileData, isComplete }: ShippingInfoProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <User className="h-5 w-5 text-primary" /> Shipping Information
      </h2>
      
      {isComplete && profileData ? (
        <div className="space-y-3 pl-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Name</div>
              <div className="font-medium">
                {profileData.first_name} {profileData.middle_name && `${profileData.middle_name} `}{profileData.last_name}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Phone</div>
              <div className="font-medium">{profileData.phone_number}</div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500 mb-1">Address</div>
            <div className="font-medium">{profileData.location}</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-3">Please complete your profile to continue with checkout</p>
          <Button 
            onClick={() => navigate('/profile', { state: { redirectAfterUpdate: '/checkout' }})}
            className="bg-primary hover:bg-primary/90"
          >
            Complete Profile
          </Button>
        </div>
      )}
    </div>
  );
}
