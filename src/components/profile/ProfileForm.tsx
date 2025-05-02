
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/services/supabase/client";
import { useSession } from "@/hooks/useSession";
import { UserRound, ShoppingCart } from "lucide-react";
import { ProfileRow } from "@/types/supabase";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ProfileFormProps {
  profileData: ProfileRow;
  onProfileChange: (field: string, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}

export default function ProfileForm({ profileData, onProfileChange, onSubmit, isSaving }: ProfileFormProps) {
  return (
    <div className="p-6">
      <form onSubmit={onSubmit} className="space-y-4">
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
          <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
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
