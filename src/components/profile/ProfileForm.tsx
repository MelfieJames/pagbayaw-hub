
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User, MapPin, Phone, Save } from "lucide-react";
import { ProfileData } from "@/hooks/useProfile";

interface ProfileFormProps {
  profileData: ProfileData;
  onProfileChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

export default function ProfileForm({ 
  profileData, 
  onProfileChange, 
  onSubmit,
  isSaving 
}: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="flex items-center gap-1 text-gray-700">
                <User className="h-4 w-4 text-primary/70" /> First Name *
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={profileData.first_name}
                onChange={(e) => onProfileChange('first_name', e.target.value)}
                required
                placeholder="Enter your first name"
                className="border-gray-300 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middle_name" className="flex items-center gap-1 text-gray-700">
                <User className="h-4 w-4 text-primary/70" /> Middle Name
              </Label>
              <Input
                id="middle_name"
                name="middle_name"
                value={profileData.middle_name}
                onChange={(e) => onProfileChange('middle_name', e.target.value)}
                placeholder="Enter your middle name"
                className="border-gray-300 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name" className="flex items-center gap-1 text-gray-700">
                <User className="h-4 w-4 text-primary/70" /> Last Name *
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={profileData.last_name}
                onChange={(e) => onProfileChange('last_name', e.target.value)}
                required
                placeholder="Enter your last name"
                className="border-gray-300 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="flex items-center gap-1 text-gray-700">
              <Phone className="h-4 w-4 text-primary/70" /> Phone Number *
            </Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={profileData.phone_number}
              onChange={(e) => onProfileChange('phone_number', e.target.value)}
              required
              placeholder="Enter your phone number"
              className="border-gray-300 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1 text-gray-700">
              <MapPin className="h-4 w-4 text-primary/70" /> Location/Address *
            </Label>
            <Input
              id="location"
              name="location"
              value={profileData.location}
              onChange={(e) => onProfileChange('location', e.target.value)}
              required
              placeholder="Enter your full address"
              className="border-gray-300 focus:ring-primary focus:border-primary"
            />
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="ml-auto flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
