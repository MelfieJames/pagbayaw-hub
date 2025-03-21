import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function AnimatedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: AnimatedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ width, height }}
      ref={imgRef}
    >
      {isInView && (
        <>
          <div 
            className={cn(
              "absolute inset-0 bg-black/5",
              isLoaded ? "animate-fade-out" : ""
            )}
          />
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            className={cn(
              "object-cover w-full h-full transition-opacity duration-500",
              isLoaded ? "opacity-100 animate-blur-in" : "opacity-0"
            )}
          />
        </>
      )}
    </div>
  );
}

