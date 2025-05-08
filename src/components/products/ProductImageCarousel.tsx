
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageCarouselProps {
  mainImage: string | null;
  additionalImages?: string[];
  productName: string;
  isOutOfStock?: boolean;
}

export function ProductImageCarousel({ mainImage, additionalImages = [], productName, isOutOfStock }: ProductImageCarouselProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = [mainImage, ...additionalImages].filter(Boolean) as string[];

  useEffect(() => {
    // When mainImage or additionalImages change, reset the selected image
    setSelectedImage(mainImage);
    setCurrentIndex(0);
  }, [mainImage, additionalImages]);

  const handlePrevImage = () => {
    if (allImages.length > 1) {
      const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedImage(allImages[newIndex]);
    }
  };

  const handleNextImage = () => {
    if (allImages.length > 1) {
      const newIndex = (currentIndex + 1) % allImages.length;
      setCurrentIndex(newIndex);
      setSelectedImage(allImages[newIndex]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
        {/* Main image container */}
        <div className="relative w-full h-full">
          <img
            src={selectedImage || "/placeholder.svg"}
            alt={productName}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 hover:scale-105",
              isOutOfStock && "blur-[2px] brightness-90"
            )}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/60 text-white px-4 py-2 rounded-md font-medium shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Left/Right navigation buttons for larger images */}
          {allImages.length > 1 && (
            <>
              <Button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white text-gray-800 shadow-md z-10 transition-all hover:scale-110"
                size="icon"
                variant="ghost"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white text-gray-800 shadow-md z-10 transition-all hover:scale-110"
                size="icon"
                variant="ghost"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnail navigation */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(image);
                setCurrentIndex(index);
              }}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden transition-all duration-300",
                selectedImage === image 
                  ? "ring-2 ring-purple-500 shadow-md scale-105" 
                  : "hover:ring-1 hover:ring-purple-400 hover:scale-[1.03]"
              )}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
