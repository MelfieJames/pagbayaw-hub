
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Product } from "@/types/product";
import { ProductList } from "@/components/products/ProductList";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { SearchBar } from "@/components/products/SearchBar";
import Navbar from "@/components/Navbar";
import { useProductQueries } from "@/hooks/products/useProductQueries";
import { useProductActions } from "@/hooks/products/useProductActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ErrorModal from "@/components/ErrorModal";
import Footer from "@/components/Footer";

export default function Products() {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "" });

  const { products, inventoryData, productReviews, hasUserReviewedProduct } = useProductQueries();
  const { handleBuyNow, handleAddToCart } = useProductActions();

  // Check if we need to open the review dialog from navigation state
  useEffect(() => {
    if (location.state?.openReview && location.state?.reviewProduct) {
      setReviewProduct(location.state.reviewProduct);
      setReviewDialogOpen(true);
      // Clear the location state to prevent dialog from reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const productRatings = productReviews.reduce((acc, review) => {
    if (!acc[review.product_id]) {
      acc[review.product_id] = { total: 0, count: 0 };
    }
    acc[review.product_id].total += review.rating;
    acc[review.product_id].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  const handleSubmitReview = async () => {
    if (!user?.id || !reviewProduct || rating === 0) {
      toast("Please select a rating before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting review for product:", reviewProduct);
      
      // Check if user has already reviewed this product
      if (hasUserReviewedProduct(reviewProduct.id)) {
        setErrorMessage({
          title: "Already Reviewed",
          message: "You have already reviewed this product. You can only review a product once."
        });
        setErrorModalOpen(true);
        setReviewDialogOpen(false);
        setReviewProduct(null);
        setRating(0);
        setComment("");
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: reviewProduct.id,
          rating,
          comment,
          purchase_item_id: reviewProduct.purchaseId
        });

      if (error) {
        console.error("Error submitting review:", error);
        if (error.code === '23505') {
          setErrorMessage({
            title: "Already Reviewed",
            message: "You have already reviewed this product. You can only review a product once."
          });
          setErrorModalOpen(true);
        } else {
          toast("Failed to submit review: " + error.message);
        }
        return;
      }

      toast("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews', user.id] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', user.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      
      // Close the dialog and reset state
      setReviewDialogOpen(false);
      setReviewProduct(null);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error('Error submitting review:', error);
      toast("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FilterSidebar
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="md:col-span-3">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <div className="mt-6"> {/* Increased margin-top from 4 to 6 */}
              <ProductList
                products={products}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                inventoryData={inventoryData || []}
                productRatings={productRatings}
                onProductClick={setSelectedProduct}
              />
            </div>
          </div>
        </div>

        <ProductDetailsModal
          product={selectedProduct}
          products={products}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={(productId) => handleBuyNow(productId)}
          inventory={selectedProduct ? inventoryData?.find(item => item.product_id === selectedProduct.id) : undefined}
          productRatings={productRatings}
        />

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate & Review {reviewProduct?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {reviewProduct?.image && (
                <div className="flex justify-center">
                  <img 
                    src={reviewProduct.image} 
                    alt={reviewProduct.name}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    <Star className="h-8 w-8" fill={rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
              <Textarea
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleSubmitReview} 
                disabled={rating === 0 || isSubmitting} 
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Modal */}
        <ErrorModal
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          title={errorMessage.title}
          message={errorMessage.message}
        />
      </div>
      <Footer />
    </div>
  );
}
