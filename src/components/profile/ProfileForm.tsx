
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/services/supabase/client";
import { UserRound, Upload } from "lucide-react";
import { ProfileData } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormProps {
  profileData: ProfileData;
  onProfileChange: (field: string, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}

export default function ProfileForm({ profileData, onProfileChange, onSubmit, isSaving }: ProfileFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profileData.profile_picture || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    setIsUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      onProfileChange('profile_picture', publicUrl.publicUrl);
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let pictureUrl = profileData.profile_picture;
    
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar();
      if (uploadedUrl) {
        pictureUrl = uploadedUrl;
      }
    }
    
    // Continue with regular form submission
    onSubmit(e);
  };

  const getInitials = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name[0]}${profileData.last_name[0]}`;
    }
    return profileData.email ? profileData.email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="p-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <Input
              id="first_name"
              name="first_name"
              value={profileData.first_name || ''}
              onChange={(e) => onProfileChange('first_name', e.target.value)}
              required
              placeholder="First Name"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <Input
              id="last_name"
              name="last_name"
              value={profileData.last_name || ''}
              onChange={(e) => onProfileChange('last_name', e.target.value)}
              required
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">
            Middle Name (Optional)
          </label>
          <Input
            id="middle_name"
            name="middle_name"
            value={profileData.middle_name || ''}
            onChange={(e) => onProfileChange('middle_name', e.target.value)}
            placeholder="Middle Name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <Input
            id="phone_number"
            name="phone_number"
            value={profileData.phone_number || ''}
            onChange={(e) => onProfileChange('phone_number', e.target.value)}
            required
            placeholder="Phone Number"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Primary Address
          </label>
          <Input
            id="location"
            name="location"
            value={profileData.location || ''}
            onChange={(e) => onProfileChange('location', e.target.value)}
            required
            placeholder="Address"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || isUploading} className="w-full md:w-auto">
            {(isSaving || isUploading) ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
