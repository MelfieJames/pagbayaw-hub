
import { UserCircle, Check, AlertTriangle, Loader2 } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProfileHeaderProps {
  isComplete: boolean;
  isFetched?: boolean;
}

export default function ProfileHeader({ isComplete, isFetched = false }: ProfileHeaderProps) {
  return (
    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
      <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gray-800">
        <UserCircle className="h-5 w-5 text-primary" /> Your Profile
      </CardTitle>
      <CardDescription className="text-gray-600">
        Update your personal information. This information will be used for order processing.
      </CardDescription>
      
      {isFetched ? (
        isComplete ? (
          <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center w-fit">
            <Check className="h-3 w-3 mr-1" /> Profile Complete
          </div>
        ) : (
          <div className="mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center w-fit">
            <AlertTriangle className="h-3 w-3 mr-1" /> Please complete your profile
          </div>
        )
      ) : (
        <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center w-fit">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading profile data...
        </div>
      )}
    </CardHeader>
  );
}
