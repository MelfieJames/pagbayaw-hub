import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AchievementImageCarouselProps {
  images: string[];
  title: string;
}

export const AchievementImageCarousel = ({ images, title }: AchievementImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      <div className="flex justify-center items-center">
        <img
          src={images[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className="max-w-full h-auto rounded-lg"
        />
      </div>
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 bg-black/20 hover:bg-black/40"
            onClick={previousImage}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 bg-black/20 hover:bg-black/40"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};