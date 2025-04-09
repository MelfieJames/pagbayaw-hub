
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AtSign, ArrowLeft } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSuccessModal from "@/components/profile/ProfileSuccessModal";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get the redirect path from location state
  const redirectAfterUpdate = location.state?.redirectAfterUpdate || "/products";
  
  const { 
    profileData, 
    updateProfileField, 
    isLoading, 
    isComplete,
    isFetched,
    updateProfile,
    error
  } = useProfile();

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { redirectAfterLogin: '/profile', message: "Please log in to access your profile" }
      });
    }
  }, [user, navigate]);

  const handleChange = (field: string, value: string) => {
    updateProfileField(field as keyof typeof profileData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation for required fields
    if (!profileData.first_name.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!profileData.last_name.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (!profileData.phone_number.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!profileData.location.trim()) {
      toast.error("Location/Address is required");
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateProfile(profileData);
      if (success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      // Error is already handled in the hook and displayed via toast
      console.error("Error during profile update:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate(redirectAfterUpdate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4 flex items-center gap-2 hover:bg-gray-100"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
              <img 
                src={`https://ui-avatars.com/api/?name=${profileData.first_name}+${profileData.last_name}&background=random&color=fff&size=128`} 
                alt="User avatar" 
                className="w-20 h-20 rounded-full"
              />
            </div>
          </div>
          
          <Card className="shadow-lg border-t-4 border-t-primary">
            <ProfileHeader isComplete={isComplete} isFetched={isFetched} />
            
            {error && (
              <div className="px-6 py-2 bg-red-50 text-red-700 text-sm border-t border-red-200">
                {error}
              </div>
            )}
            
            <ProfileForm 
              profileData={profileData}
              onProfileChange={handleChange}
              onSubmit={handleSubmit}
              isSaving={isSaving}
            />
            
            {user && (
              <div className="p-4 pt-2 border-t bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AtSign className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ProfileSuccessModal 
        open={showSuccessModal} 
        onOpenChange={setShowSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </div>
  );
}
