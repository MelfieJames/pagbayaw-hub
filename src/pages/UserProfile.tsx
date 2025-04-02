
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, MapPin, Phone, AtSign, Save, UserCircle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface UserProfileData {
  first_name: string;
  middle_name: string;
  last_name: string;
  location: string;
  phone_number: string;
}

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    location: "",
    phone_number: ""
  });

  // Get the redirect path from location state
  const redirectAfterUpdate = location.state?.redirectAfterUpdate || "/products";

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { redirectAfterLogin: '/profile', message: "Please log in to access your profile" }
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, middle_name, last_name, location, phone_number')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfileData({
            first_name: data.first_name || "",
            middle_name: data.middle_name || "",
            last_name: data.last_name || "",
            location: data.location || "",
            phone_number: data.phone_number || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
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
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name.trim(),
          middle_name: profileData.middle_name.trim(),
          last_name: profileData.last_name.trim(),
          location: profileData.location.trim(),
          phone_number: profileData.phone_number.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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

  // Check if profile is complete
  const isProfileComplete = !!(
    profileData.first_name?.trim() && 
    profileData.last_name?.trim() && 
    profileData.phone_number?.trim() && 
    profileData.location?.trim()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 border-b">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-5 w-5" /> Your Profile
              </CardTitle>
              <CardDescription>
                Update your personal information. This information will be used for order processing.
              </CardDescription>
              {isProfileComplete && (
                <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center w-fit">
                  <Check className="h-3 w-3 mr-1" /> Profile Complete
                </div>
              )}
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="flex items-center gap-1">
                      <User className="h-4 w-4" /> First Name *
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
                    <Label htmlFor="middle_name" className="flex items-center gap-1">
                      <User className="h-4 w-4" /> Middle Name
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
                    <Label htmlFor="last_name" className="flex items-center gap-1">
                      <User className="h-4 w-4" /> Last Name *
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
                  <Label htmlFor="phone_number" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone Number *
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
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Location/Address *
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
                  className="ml-auto flex items-center gap-2"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Profile Updated
            </DialogTitle>
            <DialogDescription>
              Your profile information has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessModalClose}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
