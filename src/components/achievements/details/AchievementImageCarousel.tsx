
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface AchievementImageCarouselProps {
  images: string[];
  title: string;
}

export const AchievementImageCarousel = ({ images, title }: AchievementImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      <div className="flex justify-center items-center h-[400px]">
        <img
          src={images[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover rounded-lg"
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
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentImageIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
