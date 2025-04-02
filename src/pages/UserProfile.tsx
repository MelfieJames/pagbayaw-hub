
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, MapPin, Phone, AtSign, Save, UserCircle, Check, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useProfile, ProfileData } from "@/hooks/useProfile";

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
    setProfileData, 
    isLoading, 
    isComplete, 
    updateProfile 
  } = useProfile();

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { redirectAfterLogin: '/profile', message: "Please log in to access your profile" }
      });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
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
              <UserCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <User className="h-5 w-5 text-primary" /> Your Profile
              </CardTitle>
              <CardDescription className="text-gray-600">
                Update your personal information. This information will be used for order processing.
              </CardDescription>
              {isComplete && (
                <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center w-fit">
                  <Check className="h-3 w-3 mr-1" /> Profile Complete
                </div>
              )}
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="flex items-center gap-1 text-gray-700">
                      <User className="h-4 w-4 text-primary/70" /> First Name *
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your first name"
                      className="border-gray-300 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name" className="flex items-center gap-1 text-gray-700">
                      <User className="h-4 w-4 text-primary/70" /> Middle Name
                    </Label>
                    <Input
                      id="middle_name"
                      name="middle_name"
                      value={profileData.middle_name}
                      onChange={handleChange}
                      placeholder="Enter your middle name"
                      className="border-gray-300 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="flex items-center gap-1 text-gray-700">
                      <User className="h-4 w-4 text-primary/70" /> Last Name *
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your last name"
                      className="border-gray-300 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="flex items-center gap-1 text-gray-700">
                    <Phone className="h-4 w-4 text-primary/70" /> Phone Number *
                  </Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                    className="border-gray-300 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1 text-gray-700">
                    <MapPin className="h-4 w-4 text-primary/70" /> Location/Address *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full address"
                    className="border-gray-300 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                {user && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <AtSign className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="ml-auto flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Profile Updated
            </DialogTitle>
            <DialogDescription>
              Your profile information has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={handleSuccessModalClose}
              className="bg-primary hover:bg-primary/90"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
