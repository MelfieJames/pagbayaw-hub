
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

export interface ProfileData {
  first_name: string;
  middle_name: string;
  last_name: string;
  location: string;
  phone_number: string;
}

/**
 * Hook to manage user profile data
 * @param redirectIfIncomplete If true, will redirect to profile page if profile is incomplete
 * @param redirectPath Path to redirect to if profile is incomplete
 * @returns Profile data and functions
 */
export const useProfile = (redirectIfIncomplete?: boolean, redirectPath?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    location: "",
    phone_number: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  // Fetch profile data using Edge Function instead of direct database access
  const fetchProfileViaEdgeFunction = async () => {
    if (!user) return null;
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Failed to get session");
      }
      
      const response = await fetch(`https://msvlqapipscspxukbhyb.supabase.co/functions/v1/debug-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }
      
      const result = await response.json();
      console.log("Profile fetched via edge function:", result);
      return result.profile;
    } catch (error) {
      console.error("Error fetching profile via edge function:", error);
      return null;
    }
  };

  // Update profile data using Edge Function
  const updateProfileViaEdgeFunction = async (profileData: ProfileData) => {
    if (!user) return false;
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Failed to get session");
      }
      
      const response = await fetch(`https://msvlqapipscspxukbhyb.supabase.co/functions/v1/debug-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      const result = await response.json();
      console.log("Profile updated via edge function:", result);
      return result.profile;
    } catch (error) {
      console.error("Error updating profile via edge function:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        const profileData = await fetchProfileViaEdgeFunction();
        
        if (profileData) {
          const profileFields = {
            first_name: profileData.first_name || "",
            middle_name: profileData.middle_name || "",
            last_name: profileData.last_name || "",
            location: profileData.location || "",
            phone_number: profileData.phone_number || ""
          };
          
          setProfileData(profileFields);
          setIsFetched(true);
          
          // Check if profile is complete
          const isProfileComplete = !!(
            profileFields.first_name?.trim() && 
            profileFields.last_name?.trim() && 
            profileFields.phone_number?.trim() && 
            profileFields.location?.trim()
          );
          
          setIsComplete(isProfileComplete);
          console.log("Profile is complete:", isProfileComplete);
          
          // If redirectIfIncomplete is true and profile is not complete, redirect to profile page
          if (redirectIfIncomplete && !isProfileComplete && redirectPath) {
            toast.info("Please complete your profile before proceeding");
            navigate(redirectPath, { 
              state: { redirectAfterUpdate: window.location.pathname }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, redirectIfIncomplete, redirectPath]);

  /**
   * Update user profile in the database
   * @param profileData Profile data to update
   * @returns Promise resolving to success status
   */
  const updateProfile = async (profileData: ProfileData) => {
    if (!user) return false;

    try {
      console.log("Updating profile with data:", profileData);
      
      const updatedProfile = await updateProfileViaEdgeFunction(profileData);
      
      if (updatedProfile) {
        setProfileData({
          first_name: updatedProfile.first_name || "",
          middle_name: updatedProfile.middle_name || "",
          last_name: updatedProfile.last_name || "",
          location: updatedProfile.location || "",
          phone_number: updatedProfile.phone_number || ""
        });
        
        const isProfileComplete = !!(
          updatedProfile.first_name?.trim() && 
          updatedProfile.last_name?.trim() && 
          updatedProfile.phone_number?.trim() && 
          updatedProfile.location?.trim()
        );
        
        setIsComplete(isProfileComplete);
        setIsFetched(true);
        return true;
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  // Helper to update specific fields
  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    profileData,
    setProfileData,
    updateProfileField,
    isLoading,
    isComplete,
    isFetched,
    updateProfile
  };
};
