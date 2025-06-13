
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

interface CartAnimationProps {
  trigger: boolean;
  onAnimationComplete: () => void;
}

export const CartAnimation = ({ trigger, onAnimationComplete }: CartAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [trigger, onAnimationComplete]);

  if (!isAnimating) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="animate-bounce">
        <div className="bg-green-500 text-white p-3 rounded-full shadow-lg animate-pulse">
          <ShoppingCart className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
