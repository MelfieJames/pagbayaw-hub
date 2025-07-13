import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileData } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, Phone, MapPin } from "lucide-react";

interface ProfileFormProps {
  profileData: ProfileData;
  onProfileChange: (field: string, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  isLoading: boolean;
  isEditing: boolean;
  hasProfileData: boolean;
  readOnly?: boolean; // NEW PROP
}

export default function ProfileForm({ profileData, onProfileChange, onSubmit, isSaving, isLoading, isEditing, hasProfileData, readOnly }: ProfileFormProps) {
  console.log("profileData", profileData, "isLoading", isLoading, "isEditing", isEditing, "hasProfileData", hasProfileData);

  return (
    <div className="p-8">
      {readOnly && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
          <b>Note:</b> Your profile is now locked and cannot be changed. For security and order processing, all details are read-only.
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label htmlFor="first_name" className="block text-sm font-semibold text-[#8B7355] uppercase tracking-wide">
              <User className="inline h-4 w-4 mr-2 text-[#0E4A22]" />
              First Name *
            </label>
            <Input
              id="first_name"
              name="first_name"
              value={profileData.first_name || ''}
              onChange={(e) => onProfileChange('first_name', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              required
              placeholder="Enter your first name"
              className="border-2 border-[#C4A484] focus:border-[#8B7355] rounded-xl p-4 text-lg"
              readOnly={readOnly}
            />
          </div>
          
          <div className="space-y-3">
            <label htmlFor="last_name" className="block text-sm font-semibold text-[#8B7355] uppercase tracking-wide">
              <User className="inline h-4 w-4 mr-2 text-[#0E4A22]" />
              Last Name *
            </label>
            <Input
              id="last_name"
              name="last_name"
              value={profileData.last_name || ''}
              onChange={(e) => onProfileChange('last_name', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              required
              placeholder="Enter your last name"
              className="border-2 border-[#C4A484] focus:border-[#8B7355] rounded-xl p-4 text-lg"
              readOnly={readOnly}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="middle_name" className="block text-sm font-semibold text-[#8B7355] uppercase tracking-wide">
            <User className="inline h-4 w-4 mr-2 text-[#0E4A22]" />
            Middle Name (Optional)
          </label>
          <Input
            id="middle_name"
            name="middle_name"
            value={profileData.middle_name || ''}
            onChange={(e) => onProfileChange('middle_name', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            placeholder="Enter your middle name"
            className="border-2 border-[#C4A484] focus:border-[#8B7355] rounded-xl p-4 text-lg"
            readOnly={readOnly}
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="phone_number" className="block text-sm font-semibold text-[#8B7355] uppercase tracking-wide">
            <Phone className="inline h-4 w-4 mr-2 text-[#0E4A22]" />
            Phone Number *
          </label>
          <Input
            id="phone_number"
            name="phone_number"
            value={profileData.phone_number || ''}
            onChange={(e) => onProfileChange('phone_number', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            required
            placeholder="Enter your phone number"
            className="border-2 border-[#C4A484] focus:border-[#8B7355] rounded-xl p-4 text-lg"
            readOnly={readOnly}
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="location" className="block text-sm font-semibold text-[#8B7355] uppercase tracking-wide">
            <MapPin className="inline h-4 w-4 mr-2 text-[#0E4A22]" />
            Primary Address *
          </label>
          <Input
            id="location"
            name="location"
            value={profileData.location || ''}
            onChange={(e) => onProfileChange('location', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            required
            placeholder="Enter your complete address"
            className="border-2 border-[#C4A484] focus:border-[#8B7355] rounded-xl p-4 text-lg"
            readOnly={readOnly}
          />
        </div>

        <div className="flex justify-end pt-6 border-t-2 border-[#C4A484]">
          <Button 
            type="submit" 
            disabled={isSaving || readOnly}
            className="bg-[#8B7355] hover:bg-[#6D5A42] text-white shadow-xl px-8 py-4 text-lg font-semibold rounded-xl"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-3" />
                Saving Profile...
              </>
            ) : (
              readOnly ? 'Profile Locked' : 'Save Profile'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
