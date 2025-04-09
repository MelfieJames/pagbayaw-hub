
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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Direct fetch from Supabase
  const fetchProfileFromSupabase = async () => {
    if (!user) return null;
    
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, middle_name, last_name, location, phone_number')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching profile from Supabase:", error);
      setError("Failed to fetch profile data");
      return null;
    }
  };

  // Update profile directly to Supabase
  const updateProfileToSupabase = async (profileData: ProfileData) => {
    if (!user) return null;
    
    try {
      setError(null);
      
      // Validate the data before sending
      if (!profileData.first_name.trim()) {
        throw new Error("First name is required");
      }
      
      if (!profileData.last_name.trim()) {
        throw new Error("Last name is required");
      }
      
      if (!profileData.location.trim()) {
        throw new Error("Location is required");
      }
      
      if (!profileData.phone_number.trim()) {
        throw new Error("Phone number is required");
      }
      
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking profile:", checkError);
        throw new Error(`Failed to check profile: ${checkError.message}`);
      }
      
      let result;
      
      if (!existingProfile) {
        console.log("Profile doesn't exist, creating new profile");
        // Insert new profile
        const { data, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: profileData.first_name,
            middle_name: profileData.middle_name || '',
            last_name: profileData.last_name,
            location: profileData.location,
            phone_number: profileData.phone_number,
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
        
        if (!data || data.length === 0) {
          console.error("No data returned after profile creation");
          throw new Error("No data returned after profile creation");
        }
        
        result = data[0];
        console.log("New profile created:", result);
      } else {
        console.log("Profile exists, updating profile");
        // Update existing profile
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: profileData.first_name,
            middle_name: profileData.middle_name || '',
            last_name: profileData.last_name,
            location: profileData.location,
            phone_number: profileData.phone_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select();
          
        if (updateError) {
          console.error("Error updating profile:", updateError);
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
        
        if (!data || data.length === 0) {
          console.error("No data returned after profile update");
          throw new Error("No data returned after profile update");
        }
        
        result = data[0];
        console.log("Profile updated successfully:", result);
      }
      
      return result;
    } catch (error) {
      console.error("Error updating profile to Supabase:", error);
      throw error;
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
        setError(null);
        
        const profileData = await fetchProfileFromSupabase();
        
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
        } else {
          // Create a new empty profile in the database
          try {
            await supabase
              .from('profiles')
              .upsert({ 
                id: user.id,
                email: user.email,
                first_name: "",
                middle_name: "",
                last_name: "",
                location: "",
                phone_number: ""
              });
              
            setProfileData({
              first_name: "",
              middle_name: "",
              last_name: "",
              location: "",
              phone_number: ""
            });
            
            setIsFetched(true);
            setIsComplete(false);
          } catch (createError) {
            console.error("Error creating empty profile:", createError);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error instanceof Error ? error.message : "Failed to load profile data");
        toast.error("Failed to load profile data");
        
        // Try again if we've failed less than 3 times
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(fetchProfile, 2000); // Retry after 2 seconds
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, redirectIfIncomplete, redirectPath, retryCount]);

  /**
   * Update user profile in the database
   * @param profileData Profile data to update
   * @returns Promise resolving to success status
   */
  const updateProfile = async (profileData: ProfileData) => {
    if (!user) return false;

    try {
      setError(null);
      console.log("Updating profile with data:", profileData);
      
      const updatedProfile = await updateProfileToSupabase(profileData);
      
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
        toast.success("Profile updated successfully");
        return true;
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
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
    updateProfile,
    error
  };
};
