
import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader 
        className={cn(
          sizeClasses[size], 
          "animate-spin text-transparent bg-gradient-to-r from-green-500 via-amber-500 to-brown-500 bg-clip-text"
        )} 
      />
    </div>
  );
}
