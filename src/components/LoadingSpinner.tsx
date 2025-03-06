
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
    md: "h-8 w-8",
    lg: "h-16 w-16"  // Increased size for large spinner
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader 
        className={cn(
          sizeClasses[size], 
          "animate-spin text-[#8B7355]"
        )} 
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
