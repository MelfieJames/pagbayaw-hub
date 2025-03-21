import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-300 active:scale-[0.97] overflow-hidden",
          "before:absolute before:inset-0 before:transition-all before:duration-500 hover:before:opacity-90",
          
          // Size variants
          size === "sm" && "text-xs px-4 py-2 rounded-full",
          size === "md" && "text-sm px-6 py-3 rounded-full",
          size === "lg" && "text-base px-8 py-4 rounded-full",
          
          // Style variants
          variant === "primary" && [
            "text-primary-foreground",
            "before:bg-foreground",
          ],
          variant === "secondary" && [
            "text-accent-foreground border border-border",
            "before:bg-accent/60 before:opacity-0 hover:before:opacity-100",
          ],
          variant === "outline" && [
            "text-foreground border border-border",
            "before:bg-accent/40 before:opacity-0 hover:before:opacity-100",
          ],
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export default GradientButton;

