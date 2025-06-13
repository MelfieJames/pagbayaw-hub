
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ShoppingCart, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProductReviews } from "./ProductReviews";
import { SimilarProducts } from "./SimilarProducts";
import { useProductQueries } from "@/hooks/products/useProductQueries";
import { ScrollArea } from "@/components/ui/scroll-area";
import { showCartAddNotification } from "./CartAddNotification";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: any, qty: any) => Promise<void>;
  onBuyNow: (productId: any, qty: any) => Promise<void>;
  inventory: any;
  productRatings: any;
}

export function ProductDetailsModal({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  inventory, 
  productRatings 
}: ProductDetailsModalProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { products, productReviews, refetchProductReviews } = useProductQueries();

  if (!product) return null;

  const isOutOfStock = inventory?.quantity === 0;
  const productSpecificReviews = productReviews.filter((review: any) => review.product_id === product.id);

  const addToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      setIsAddingToCart(true);
      await onAddToCart(product.id, 1);
      
      showCartAddNotification(product.product_name);
      
      // Close modal and trigger cart animation
      onClose();
      if ((window as any).triggerCartAnimation) {
        (window as any).triggerCartAnimation();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleProductClick = (product: Product) => {
    onClose();
    navigate(`/products/${product.id}`);
  };

  return (
    <Sheet open={!!product} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>{product.product_name}</SheetTitle>
          <SheetDescription>
            {product.description}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.product_name}
                className="w-full h-auto rounded-md"
              />
              {isOutOfStock && (
                <Badge variant="destructive" className="absolute top-2 left-2">
                  Out of Stock
                </Badge>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">₱{product.product_price.toFixed(2)}</h3>
              <p className="text-gray-600">Category: {product.category}</p>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>
                  {productSpecificReviews.length > 0 
                    ? (productSpecificReviews.reduce((sum: number, review: { rating: number; }) => sum + review.rating, 0) / productSpecificReviews.length).toFixed(1)
                    : 'No ratings yet'
                  } ({productSpecificReviews.length} reviews)
                </span>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={addToCart}
                disabled={isAddingToCart || isOutOfStock}
              >
                {isAddingToCart ? (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
              <ProductReviews
                productId={product.id}
                productReviews={productReviews}
                refetchProductReviews={refetchProductReviews}
              />
            </div>
          </div>
          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4">Similar Products</h4>
            <SimilarProducts
              products={products}
              currentProductId={product.id}
              category={product.category}
              onProductClick={handleProductClick}
              inventoryData={inventory}
            />
          </div>
        </ScrollArea>
        <SheetClose asChild>
          <Button
            type="button"
            variant="secondary"
            className="absolute top-4 right-4 sm:right-8 md:right-12 lg:right-16"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
