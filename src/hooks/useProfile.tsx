
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface ProfileData {
  first_name: string;
  middle_name: string;
  last_name: string;
  location: string;
  phone_number: string;
}

export const useProfile = (redirectIfIncomplete?: boolean, redirectPath?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    location: "",
    phone_number: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, middle_name, last_name, location, phone_number')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const profileFields = {
            first_name: data.first_name || "",
            middle_name: data.middle_name || "",
            last_name: data.last_name || "",
            location: data.location || "",
            phone_number: data.phone_number || ""
          };
          
          setProfileData(profileFields);
          
          // Check if profile is complete
          const isProfileComplete = !!(
            profileFields.first_name?.trim() && 
            profileFields.last_name?.trim() && 
            profileFields.phone_number?.trim() && 
            profileFields.location?.trim()
          );
          
          setIsComplete(isProfileComplete);
          
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

  const updateProfile = async (profileData: ProfileData) => {
    if (!user) return false;

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
      
      setProfileData(profileData);
      setIsComplete(true);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  return {
    profileData,
    setProfileData,
    isLoading,
    isComplete,
    updateProfile
  };
};
