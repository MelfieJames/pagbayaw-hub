
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Image } from "lucide-react";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
    if (onImageClick) onImageClick(images[index]);
  };

  const goToPrevious = () => {
    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    if (onImageClick) onImageClick(images[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(newIndex);
    if (onImageClick) onImageClick(images[newIndex]);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-md">
        <Image className="h-16 w-16 text-gray-300" />
        <p className="mt-3 text-gray-500">No images available for this event</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="cursor-pointer overflow-hidden rounded-md h-48"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={image} 
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative flex items-center justify-center min-h-[80vh]">
            <Button 
              className="absolute left-2 bg-black/50 hover:bg-black/70 text-white"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft size={24} />
            </Button>
            
            <img 
              src={images[currentImageIndex]} 
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="max-h-[80vh] max-w-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            
            <Button 
              className="absolute right-2 bg-black/50 hover:bg-black/70 text-white"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight size={24} />
            </Button>
            
            <Button 
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              variant="ghost"
              size="icon"
              onClick={() => setModalOpen(false)}
            >
              <X size={24} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
