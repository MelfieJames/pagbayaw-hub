
import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementImagesGalleryProps {
  images: string[];
  onImageClick?: (image: string) => void;
  selectedImage: string | null;
}

export const AchievementImagesGallery = ({ 
  images, 
  onImageClick,
  selectedImage 
}: AchievementImagesGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setDialogOpen(true);
    if (onImageClick) onImageClick(images[index]);
  };

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(newIndex);
    if (onImageClick) onImageClick(images[newIndex]);
  };

  const prevImage = () => {
    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    if (onImageClick) onImageClick(images[newIndex]);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="aspect-square overflow-hidden rounded-lg cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={image} 
              alt={`Gallery image ${index + 1}`} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>

      <Dialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="max-w-7xl p-0 bg-black/90 border-none">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={() => setDialogOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <img
              src={images[currentImageIndex]}
              alt={`Full size gallery image ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="bg-black/90 p-4 flex justify-center gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden ${
                  index === currentImageIndex ? "ring-2 ring-white" : "opacity-70"
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
