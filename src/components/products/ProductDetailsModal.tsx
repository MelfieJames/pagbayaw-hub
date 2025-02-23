
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { SimilarProducts } from "./SimilarProducts";
import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ReviewsModal } from "./ReviewsModal";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    onClose();
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
          <div className="space-y-4">
            <ScrollArea className="h-[300px]">
              <ProductImageCarousel
                mainImage={product.image}
                productName={product.product_name}
              />
            </ScrollArea>
            <Badge variant="secondary" className="w-fit">
              {product.category}
            </Badge>
            <p className="text-2xl font-bold">₱{product.product_price.toFixed(2)}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Quantity</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || stockQuantity === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(prev => Math.min(stockQuantity, prev + 1))}
                  disabled={quantity >= stockQuantity || stockQuantity === 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {stockQuantity} pieces available
                </span>
              </div>
            </div>

            {rating && (
              <Button
                variant="outline"
                onClick={() => setShowReviews(true)}
                className="w-full flex items-center justify-center gap-2"
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
                <span>See {rating.count} Reviews</span>
              </Button>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleBuyNow(product.id)}
            disabled={stockQuantity === 0}
          >
            Buy Now
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleAddToCart(product.id)}
            disabled={stockQuantity === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </DialogFooter>

        <ScrollArea className="max-h-[300px]">
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
        </ScrollArea>

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
