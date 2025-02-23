
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
import { ShoppingCart, Plus, Minus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ReviewsModal } from "./ReviewsModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";

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

  const { data: reviews = [] } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

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
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.product_name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ProductImageCarousel
                  mainImage={product.image}
                  productName={product.product_name}
                />
                <Badge variant="secondary" className="w-fit">
                  {product.category}
                </Badge>
                <p className="text-2xl font-bold">₱{product.product_price.toFixed(2)}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Description</p>
                  <div className="w-full rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Reviews</p>
                    {rating && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReviews(true)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        See all {rating.count} reviews
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{review.profiles.email}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    review.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'PP')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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

            <div>
              <h3 className="text-lg font-semibold mb-4">From the Same Category</h3>
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
            </div>
          </div>
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
