
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
    <div className="relative w-full h-[600px] overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
           style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
        {images.map((image, index) => (
          <div
            key={index}
            className="min-w-full h-full"
            style={{ transform: `translateX(${index * 100}%)` }}
          >
            <img
              src={image}
              alt={`${title} - Image ${index + 1}`}
              className="w-full h-full object-contain bg-black/5"
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 bg-black/20 hover:bg-black/40"
              onClick={previousImage}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 bg-black/20 hover:bg-black/40"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? "bg-white scale-110" 
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AchievementImageCarousel;
