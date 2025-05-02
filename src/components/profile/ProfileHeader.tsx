import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProfileHeaderProps {
  isComplete: boolean;
  isFetched?: boolean;
}

export default function ProfileHeader({ isComplete, isFetched = false }: ProfileHeaderProps) {
  return (
    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
      <CardTitle className="text-2xl font-bold text-gray-800">
        Your Profile
      </CardTitle>
      <CardDescription className="text-gray-600">
        Update your personal information. This information will be used for order processing.
      </CardDescription>
    </CardHeader>
  );
}
