
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
    <div className="flex items-center justify-center min-h-[120px]">
      <svg
        className="animate-spin"
        width={size === "lg" ? 64 : 32}
        height={size === "lg" ? 64 : 32}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke="#A7E9C5"
          strokeWidth="5"
        />
        <path
          className="opacity-75"
          fill="#0E4A22"
          d="M25 5a20 20 0 1 1-14.14 34.14l3.54-3.54A15 15 0 1 0 25 10V5z"
        />
      </svg>
    </div>
  );
}
