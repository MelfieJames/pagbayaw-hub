
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

  // Check if profile exists and create if it doesn't
  const ensureProfileExists = async () => {
    if (!user) return;
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking profile:", checkError);
        return;
      }
      
      // If profile doesn't exist, create it
      if (!existingProfile) {
        console.log("Profile doesn't exist, creating one for user:", user.id);
        const { error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id,
            email: user.email,
            first_name: "",
            middle_name: "",
            last_name: "",
            location: "",
            phone_number: ""
          });
          
        if (createError) {
          console.error("Error creating profile:", createError);
        }
      }
    } catch (error) {
      console.error("Error in ensureProfileExists:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Ensure profile exists before fetching
        await ensureProfileExists();
        
        console.log("Fetching profile for user:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, middle_name, last_name, location, phone_number')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("Profile data fetched:", data);
        
        if (data) {
          const profileFields = {
            first_name: data.first_name || "",
            middle_name: data.middle_name || "",
            last_name: data.last_name || "",
            location: data.location || "",
            phone_number: data.phone_number || ""
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
      
      // First ensure profile exists
      await ensureProfileExists();
      
      // Update the profile
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

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      // Fetch the updated profile to confirm changes
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('first_name, middle_name, last_name, location, phone_number')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching updated profile:", fetchError);
        throw fetchError;
      }
      
      console.log("Profile updated successfully:", updatedProfile);
      
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
      }
      
      return true;
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
