
import { useState, useEffect } from "react";
import { Image } from "lucide-react";

interface AchievementImageDisplayProps {
  imageUrl: string | null;
  altText: string;
}

export const AchievementImageDisplay = ({ imageUrl, altText }: AchievementImageDisplayProps) => {
  const [error, setError] = useState(false);
  
  // Reset error state if the image URL changes
  useEffect(() => {
    setError(false);
  }, [imageUrl]);

  if (!imageUrl || error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-md mb-4">
        <Image className="h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={altText}
      className="max-h-48 w-full object-contain bg-gray-100 rounded-md mb-4"
      onError={() => setError(true)}
    />
  );
};

export default AchievementImageDisplay;
