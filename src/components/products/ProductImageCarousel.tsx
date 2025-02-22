
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageCarouselProps {
  mainImage: string | null;
  additionalImages?: string[];
  productName: string;
  isOutOfStock?: boolean;
}

export function ProductImageCarousel({ mainImage, additionalImages = [], productName, isOutOfStock }: ProductImageCarouselProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage);
  const allImages = [mainImage, ...additionalImages].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <img
          src={selectedImage || "/placeholder.svg"}
          alt={productName}
          className={cn(
            "w-full h-full object-cover transition-all",
            isOutOfStock && "blur-[2px] brightness-90"
          )}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/60 text-white px-4 py-2 rounded-md font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden",
                selectedImage === image && "ring-2 ring-primary"
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
