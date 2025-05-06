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
import { ShoppingCart, Plus, Minus, Star, Image, Video, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewsModal } from "./ReviewsModal";
import { useProductActions } from "@/hooks/products/useProductActions";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ProductDetailsModalProps {
  product: Product | null;
  products: Product[];
  onClose: () => void;
  onAddToCart: (productId: number, quantity: number) => void;
  onBuyNow: (productId: number, quantity: number) => void;
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const stockQuantity = inventory?.quantity ?? 0;
  const [reviewsToShow, setReviewsToShow] = useState(2);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const { handleDeleteReview } = useProductActions();

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  const { data: reviews = [], refetch: refetchReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      const reviewsWithUserInfo = await Promise.all((reviewsData || []).map(async (review) => {
        if (review.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', review.user_id)
            .single();
            
          if (!userError && userData) {
            const email = userData.email;
            const namePart = email.split('@')[0];
            const formattedName = namePart
              .split(/[._-]/)
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');
              
            return { 
              ...review, 
              user_name: formattedName,
              user_email: email 
            };
          }
        }
        return { 
          ...review, 
          user_name: "Anonymous User" 
        };
      }));
      
      return reviewsWithUserInfo;
    },
    enabled: !!product?.id,
  });

  const calculateProductRating = () => {
    if (!reviews || reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: total / reviews.length,
      count: reviews.length
    };
  };

  const productRating = calculateProductRating();
  const averageRating = productRating.average;
  const ratingCount = productRating.count;

  const handleEditReview = (review: any) => {
    navigate(`/products`, { 
      state: { 
        openReview: true, 
        reviewProduct: {
          ...product,
          reviewId: review.id,
          existingRating: review.rating,
          existingComment: review.comment,
          isEditing: true
        }
      }
    });
    onClose();
  };

  const onDeleteReview = async (reviewId: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const success = await handleDeleteReview(reviewId);
      if (success) {
        refetchReviews();
        toast.success("Review deleted successfully");
      }
    }
  };

  const toggleReviewsModal = () => {
    setIsReviewsModalOpen(!isReviewsModalOpen);
  };

  if (!product) return null;

  const visibleReviews = reviews.slice(0, reviewsToShow);
  const hasMoreReviews = reviews.length > reviewsToShow;

  const getAvatarLetter = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <>
      <Dialog open={!!product} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">{product.product_name}</DialogTitle>
            <DialogDescription className="sr-only">Product details for {product.product_name}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-full pr-4">
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ProductImageCarousel
                    mainImage={product.image}
                    productName={product.product_name}
                    isOutOfStock={stockQuantity === 0}
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
                    <div className="flex items-center justify-between border-t pt-4">
                      <p className="text-sm font-medium">Product Ratings ({ratingCount})</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              averageRating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm ml-1">
                          {averageRating ? averageRating.toFixed(1) : "No ratings"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {reviewsLoading ? (
                        <div className="flex justify-center py-4">
                          <LoadingSpinner />
                        </div>
                      ) : reviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">No reviews yet</p>
                      ) : (
                        visibleReviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getAvatarLetter(review.user_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{review.user_name}</p>
                                    <div className="flex mt-1">
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
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(review.created_at), 'PP')}
                                    </span>
                                    {user && user.id === review.user_id && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleEditReview(review)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => onDeleteReview(review.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                                )}
                                {review.image_url && (
                                  <div className="mt-3">
                                    <img
                                      src={review.image_url}
                                      alt="Review Image"
                                      className="rounded-md max-h-40 object-cover"
                                    />
                                  </div>
                                )}
                                {review.video_url && (
                                  <div className="mt-3">
                                    <video
                                      src={review.video_url}
                                      controls
                                      className="rounded-md max-h-40 w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {hasMoreReviews && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-primary" 
                          onClick={toggleReviewsModal}
                        >
                          See all reviews 
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => onBuyNow(product.id, quantity)}
                  disabled={stockQuantity === 0}
                >
                  Buy Now
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => onAddToCart(product.id, quantity)}
                  disabled={stockQuantity === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </DialogFooter>

              <div>
                <h3 className="text-lg font-semibold mb-4">Similar Products</h3>
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
                  inventoryData={inventory}
                />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ReviewsModal 
        isOpen={isReviewsModalOpen} 
        onClose={() => setIsReviewsModalOpen(false)}
        reviews={reviews}
        user={user}
        onEditReview={handleEditReview}
        onDeleteReview={onDeleteReview}
      />
    </>
  );
}
