import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, Edit, Package, TrendingUp, CheckCircle, XCircle } from "lucide-react";
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
        completedOrders: purchases.filter(p => p.status === 'completed').length,
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

  // Check if profile has any data (for display) - improved check
  const hasAnyProfileData = !!(
    (profileData.first_name && profileData.first_name.trim()) ||
    (profileData.last_name && profileData.last_name.trim()) ||
    (profileData.phone_number && profileData.phone_number.trim()) ||
    (profileData.location && profileData.location.trim()) ||
    (profileData.middle_name && profileData.middle_name.trim())
  );

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
      console.error("Error during profile update:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/profile");
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-amber-50 to-orange-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-amber-300 shadow-xl">
              <div className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                      {getInitials()}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-amber-900 mb-2">
                  {hasAnyProfileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Welcome!' : 'Welcome!'}
                </h3>
                
                {user?.email && (
                  <p className="text-amber-700 text-sm mb-6 flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                )}
                
                <div className="flex flex-col gap-3 mt-6">
                  <Button 
                    variant={activeTab === "profile" ? "default" : "outline"}
                    className={`w-full justify-start font-medium ${
                      activeTab === "profile" 
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg" 
                        : "border-amber-400 text-amber-800 hover:bg-amber-200"
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-3 h-5 w-5" /> My Profile
                  </Button>
                  <Button 
                    variant={activeTab === "purchases" ? "default" : "outline"}
                    className={`w-full justify-start font-medium ${
                      activeTab === "purchases" 
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg" 
                        : "border-amber-400 text-amber-800 hover:bg-amber-200"
                    }`}
                    onClick={() => setActiveTab("purchases")}
                  >
                    <ShoppingBag className="mr-3 h-5 w-5" /> Purchase History
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" ? (
              <Card className="shadow-2xl border-2 border-amber-300 bg-white">
                <div className="border-b-4 border-amber-600 bg-gradient-to-r from-amber-100 to-orange-200 p-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
                        <User className="h-8 w-8" />
                        Your Profile
                      </h2>
                      <p className="text-amber-700 mt-2">
                        {isEditing ? "Update your personal information. This information will be used for order processing." : "Your personal information"}
                      </p>
                    </div>
                    {!isEditing && (
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                      >
                        <Edit className="mr-2 h-5 w-5" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : isEditing ? (
                  <ProfileForm
                    profileData={profileData}
                    onProfileChange={handleChange}
                    onSubmit={handleSubmit}
                    isSaving={isSaving}
                    isLoading={isLoading}
                    isEditing={isEditing}
                    hasProfileData={hasAnyProfileData}
                  />
                ) : (
                  <div className="p-8">
                    {/* Show a message if all fields are empty */}
                    {!hasAnyProfileData && (
                      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
                        Your profile is incomplete. Click <b>Edit Profile</b> to add your details.
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                          <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Full Name</label>
                          <p className="text-xl font-medium text-amber-900 mt-2 flex items-center gap-2">
                            <User className="h-5 w-5 text-amber-600" />
                            {hasAnyProfileData 
                              ? `${profileData.first_name || ""} ${profileData.middle_name || ""} ${profileData.last_name || ""}`.trim() || "Not provided"
                              : "Not provided"
                            }
                          </p>
                        </div>
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                          <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Email</label>
                          <p className="text-xl font-medium text-amber-900 mt-2 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-amber-600" />
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                          <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Phone Number</label>
                          <p className="text-xl font-medium text-amber-900 mt-2 flex items-center gap-2">
                            <Phone className="h-5 w-5 text-amber-600" />
                            {profileData.phone_number || "Not provided"}
                          </p>
                        </div>
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                          <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Address</label>
                          <p className="text-xl font-medium text-amber-900 mt-2 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-amber-600" />
                            {profileData.location || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="shadow-2xl border-2 border-amber-300 bg-white">
                <div className="border-b-4 border-amber-600 bg-gradient-to-r from-amber-100 to-orange-200 p-8">
                  <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
                    <Package className="h-8 w-8" />
                    Purchase Summary
                  </h2>
                  <p className="text-amber-700 mt-2">
                    View your order statistics and history
                  </p>
                </div>
                
                <div className="p-8">
                  {/* Order Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Total Orders</div>
                          <div className="text-3xl font-bold text-blue-900">{purchaseStats?.totalOrders || 0}</div>
                        </div>
                        <Package className="h-12 w-12 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">Pending</div>
                          <div className="text-3xl font-bold text-yellow-900">{purchaseStats?.pendingOrders || 0}</div>
                        </div>
                        <TrendingUp className="h-12 w-12 text-yellow-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-green-800 uppercase tracking-wide">Completed</div>
                          <div className="text-3xl font-bold text-green-900">{purchaseStats?.completedOrders || 0}</div>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-red-800 uppercase tracking-wide">Cancelled</div>
                          <div className="text-3xl font-bold text-red-900">{purchaseStats?.cancelledOrders || 0}</div>
                        </div>
                        <XCircle className="h-12 w-12 text-red-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 p-6 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Total Spent</div>
                          <div className="text-3xl font-bold text-amber-900">₱{(purchaseStats?.totalSpent || 0).toFixed(2)}</div>
                        </div>
                        <TrendingUp className="h-12 w-12 text-amber-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleViewPurchaseHistory}
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg px-8 py-3 text-lg font-semibold"
                    >
                      <ShoppingBag className="mr-3 h-6 w-6" />
                      View Complete Purchase History
                    </Button>
                  </div>
                </div>
              </Card>
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
