import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, Edit } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileSuccessModal from "@/components/profile/ProfileSuccessModal";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

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

  // Fetch user purchase statistics
  const { data: purchaseStats } = useQuery({
    queryKey: ['user-purchase-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('status, total_amount')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        totalOrders: purchases.length,
        pendingOrders: purchases.filter(p => p.status === 'pending').length,
        completedOrders: purchases.filter(p => p.status === 'pending').length,
        cancelledOrders: purchases.filter(p => p.status === 'cancelled').length,
        totalSpent: purchases
          .filter(p => p.status !== 'cancelled')
          .reduce((sum, p) => sum + Number(p.total_amount), 0)
      };

      return stats;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { redirectAfterLogin: '/profile', message: "Please log in to access your profile" }
      });
    }
  }, [user, navigate]);

  // Check if profile has complete data to display
  const hasProfileData = profileData.first_name || profileData.last_name || profileData.phone_number || profileData.location;

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
        setIsEditing(false);
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

  const getInitials = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name[0]}${profileData.last_name[0]}`;
    }
    return profileData.email ? profileData.email.substring(0, 2).toUpperCase() : 'U';
  };

  const handleViewPurchaseHistory = () => {
    navigate('/purchase-history');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {profileData.profile_picture ? (
                    <img 
                      src={profileData.profile_picture}
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {getInitials()}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-1">
                {profileData.first_name} {profileData.last_name}
              </h3>
              
              {user?.email && (
                <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              )}
              
              <div className="flex flex-col gap-2 mt-4">
                <Button 
                  variant={activeTab === "profile" ? "default" : "outline"}
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </Button>
                <Button 
                  variant={activeTab === "purchases" ? "default" : "outline"}
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("purchases")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> Purchase History
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === "profile" ? (
              <Card className="shadow-sm border-t-4 border-t-primary">
                <div className="border-b bg-gray-50 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Your Profile
                      </h2>
                      <p className="text-gray-600">
                        {isEditing ? "Update your personal information. This information will be used for order processing." : "Your personal information"}
                      </p>
                    </div>
                    {hasProfileData && !isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                
                {isEditing || !hasProfileData ? (
                  <ProfileForm
                    profileData={profileData}
                    onProfileChange={handleChange}
                    onSubmit={handleSubmit}
                    isSaving={isSaving}
                  />
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-lg">{profileData.first_name} {profileData.middle_name} {profileData.last_name}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-lg flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone Number</label>
                          <p className="text-lg flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {profileData.phone_number || "Not provided"}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <p className="text-lg flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {profileData.location || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <Button onClick={() => setIsEditing(false)} variant="outline" className="mr-2">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="shadow-sm">
                <div className="border-b bg-gray-50 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" /> Purchase Summary
                  </h2>
                  <p className="text-gray-600">
                    View your order statistics and history
                  </p>
                </div>
                
                <div className="p-6">
                  {/* Order Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg border p-4">
                      <div className="text-sm text-gray-500">Total Orders</div>
                      <div className="text-2xl font-bold">{purchaseStats?.totalOrders || 0}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg border p-4">
                      <div className="text-sm text-gray-500">Pending</div>
                      <div className="text-2xl font-bold">{purchaseStats?.pendingOrders || 0}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg border p-4">
                      <div className="text-sm text-gray-500">Completed</div>
                      <div className="text-2xl font-bold">{purchaseStats?.completedOrders || 0}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg border p-4">
                      <div className="text-sm text-gray-500">Cancelled</div>
                      <div className="text-2xl font-bold">{purchaseStats?.cancelledOrders || 0}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg border p-4 sm:col-span-2 lg:col-span-2">
                      <div className="text-sm text-gray-500">Total Spent</div>
                      <div className="text-2xl font-bold">₱{(purchaseStats?.totalSpent || 0).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleViewPurchaseHistory}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      View Purchase History
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {/* About Me Section - Only show when not editing and has profile data */}
            {!isEditing && hasProfileData && (
              <div className="mt-4">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">About Me</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{profileData.first_name} {profileData.middle_name} {profileData.last_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{user?.email}</span>
                    </div>
                    
                    {profileData.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{profileData.phone_number}</span>
                      </div>
                    )}
                    
                    {profileData.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
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
