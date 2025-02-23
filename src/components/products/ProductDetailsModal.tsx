
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { SimilarProducts } from "./SimilarProducts";
import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Star, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ReviewsModal } from "./ReviewsModal";

interface ProductDetailsModalProps {
  product: Product | null;
  products: Product[];
  onClose: () => void;
  onAddToCart: (productId: number, quantity: number) => void;
  onBuyNow: (productId: number) => void;
  inventory: { quantity: number } | undefined;
  productRatings: Record<number, { total: number; count: number }>;
}

export function ProductDetailsModal({
  product,
  products,
  onClose,
  onAddToCart,
  onBuyNow,
  inventory,
  productRatings,
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const stockQuantity = inventory?.quantity ?? 0;

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  const handleAddToCart = (productId: number) => {
    if (!user) {
      toast("Please log in to add items to your cart");
      navigate("/login");
      return;
    }
    onAddToCart(productId, quantity);
  };

  const handleBuyNow = (productId: number) => {
    if (!user) {
      toast("Please log in to purchase items");
      navigate("/login");
      return;
    }
    onBuyNow(productId);
  };

  if (!product) return null;

  const rating = productRatings[product.id];
  const averageRating = rating ? rating.total / rating.count : 0;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.product_name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <ProductImageCarousel
            mainImage={product.image}
            productName={product.product_name}
          />
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <p className="text-2xl font-bold">₱{product.product_price.toFixed(2)}</p>
              {rating && (
                <button
                  onClick={() => setShowReviews(true)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-2"
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          averageRating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span>({rating.count} reviews)</span>
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Quantity</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(prev => Math.min(stockQuantity, prev + 1))}
                  disabled={quantity >= stockQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {stockQuantity} pieces available
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleBuyNow(product.id)}
          >
            Buy Now
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleAddToCart(product.id)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </DialogFooter>

        <SimilarProducts
          products={products}
          currentProductId={product.id}
          category={product.category}
          onProductClick={(newProduct) => {
            onClose();
            setTimeout(() => {
              const element = document.querySelector(`[data-product-id="${newProduct.id}"]`);
              element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }, 300);
          }}
        />

        <ReviewsModal
          isOpen={showReviews}
          onClose={() => setShowReviews(false)}
          productName={product.product_name}
          productId={product.id}
        />
      </DialogContent>
    </Dialog>
  );
}
