import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { ProductList } from "@/components/products/ProductList";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { SearchBar } from "@/components/products/SearchBar";
import Navbar from "@/components/Navbar";
import { useProductQueries } from "@/hooks/products/useProductQueries";
import { useProductActions } from "@/hooks/products/useProductActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Image as ImageIcon, Video, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ErrorModal from "@/components/ErrorModal";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import leavesBg from '/lovable-uploads/leaves.jpg';

export default function Products() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "" });
  
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewVideo, setReviewVideo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Add a ref to track previous open state
  const prevReviewDialogOpen = useRef(false);

  const { products, inventoryData, productReviews, hasUserReviewedProduct, getUserReviewForProduct, isLoading } = useProductQueries();
  const { handleBuyNow, handleAddToCart, handleSubmitReview } = useProductActions();

  useEffect(() => {
    if (location.state?.openReview && location.state?.reviewProduct) {
      const product = location.state.reviewProduct;
      
      // Reset any previous states
      setErrorModalOpen(false);
      setErrorMessage({ title: "", message: "" });
      
      // Check if user has already reviewed this product
      if (user && !product.isEditing && hasUserReviewedProduct(product.id)) {
        setErrorMessage({
          title: "Already Reviewed",
          message: "You have already reviewed this product. You can only review a product once."
        });
        setErrorModalOpen(true);
        navigate('.', { replace: true, state: null }); // clear state immediately after error
        return;
      }
      
      setReviewProduct(product);
      
      if (product.isEditing) {
        const existingReview = getUserReviewForProduct(product.id);
        if (existingReview) {
          setRating(existingReview.rating || 0);
          setComment(existingReview.comment || "");
        }
      }
      
      setReviewDialogOpen(true);
      navigate('.', { replace: true, state: null }); // clear state immediately after opening
    }
  }, [location.state, user, hasUserReviewedProduct, getUserReviewForProduct]);

  useEffect(() => {
    if (!reviewDialogOpen && prevReviewDialogOpen.current) {
      // Modal just closed, now safe to reset review state
      resetReviewState();
    }
    prevReviewDialogOpen.current = reviewDialogOpen;
  }, [reviewDialogOpen]);

  // Force query invalidation on mount to ensure fresh data
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews', user.id] });
    }
  }, [queryClient, user]);

  const productRatings = productReviews.reduce((acc, review) => {
    if (!acc[review.product_id]) {
      acc[review.product_id] = { total: 0, count: 0 };
    }
    acc[review.product_id].total += review.rating;
    acc[review.product_id].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewVideo(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewVideo(objectUrl);
    }
  };

  const resetMediaFiles = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo);
    }
    setReviewImage(null);
    setReviewVideo(null);
    setPreviewImage(null);
    setPreviewVideo(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const uploadMedia = async () => {
    let imageUrl = null;
    let videoUrl = null;

    if (reviewImage) {
      const fileExt = reviewImage.name.split('.').pop();
      const filePath = `reviews/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, reviewImage);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Error uploading image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    if (reviewVideo) {
      const fileExt = reviewVideo.name.split('.').pop();
      const filePath = `reviews/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, reviewVideo);

      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        throw new Error('Error uploading video');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      videoUrl = publicUrl;
    }

    return { imageUrl, videoUrl };
  };

  const handleSubmitReviewWithMedia = async () => {
    if (!user?.id || !reviewProduct || rating === 0) {
      toast("Please select a rating before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Double check to prevent duplicate reviews
      if (!reviewProduct.isEditing && hasUserReviewedProduct(reviewProduct.id)) {
        setErrorMessage({
          title: "Already Reviewed",
          message: "You have already reviewed this product. You can only review a product once."
        });
        setErrorModalOpen(true);
        setReviewDialogOpen(false);
        resetReviewState();
        return;
      }

      const { imageUrl, videoUrl } = await uploadMedia();

      if (reviewProduct.isEditing && reviewProduct.reviewId) {
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
            image_url: imageUrl || undefined,
            video_url: videoUrl || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewProduct.reviewId);

        if (error) {
          console.error("Error updating review:", error);
          toast.error("Failed to update review: " + error.message);
          return;
        }

        toast.success("Review updated successfully!");
      } else {
        const reviewData: any = {
          user_id: user.id,
          product_id: reviewProduct.id,
          rating,
          comment,
          image_url: imageUrl,
          video_url: videoUrl
        };
        
        if (reviewProduct.purchaseItemId) {
          reviewData.purchase_item_id = reviewProduct.purchaseItemId;
        }

        const { error } = await supabase
          .from('reviews')
          .insert(reviewData);

        if (error) {
          console.error("Error submitting review:", error);
          if (error.code === '23505') {
            setErrorMessage({
              title: "Already Reviewed",
              message: "You have already reviewed this product. You can only review a product once."
            });
            setErrorModalOpen(true);
          } else {
            toast.error("Failed to submit review: " + error.message);
          }
          return;
        }

        toast.success("Review submitted successfully!");
      }
      
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews', user.id] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', user.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      
      setReviewDialogOpen(false);
      resetReviewState();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetReviewState = () => {
    setReviewProduct(null);
    setRating(0);
    setComment("");
    resetMediaFiles();
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F8FFFB] via-[#E9F8F3] to-[#DFF5EC] animate-fade-in">
      <Navbar />
        {/* Hero Section in a white rounded rectangle with margin */}
        <div className="max-w-7xl mx-auto my-8 px-4 sm:px-8 md:px-12 lg:px-16 w-full">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 lg:p-14 w-full">
            <section className="relative w-full min-h-[340px] flex items-center justify-center">
              <img src={leavesBg} alt="Leaves background" className="absolute inset-0 w-full h-full object-cover z-0 rounded-2xl" />
              <div className="absolute inset-0 bg-[#66BF84]/80 z-10 rounded-2xl" />
              <div className="relative z-20 text-center max-w-3xl mx-auto px-6 py-16 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">Welcome to UNVAS Store</h1>
                <p className="text-base md:text-lg text-white">Discover premium products with competitive prices, authentic quality guarantees, and reliable customer support. Shop with confidence and experience the difference that quality makes.</p>
              </div>
            </section>
          </div>
        </div>
        {/* Main content full width */}
        <div className="container mx-auto px-4 flex-grow">
          {/* SearchBar full width */}
          <div className="w-full mb-6">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              className="w-full"
            />
          </div>
          {/* Product List */}
          <div className="w-full">
              <ProductList
                products={products}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedRating={selectedRating}
                inventoryData={inventoryData || []}
                productRatings={productRatings}
                onProductClick={setSelectedProduct}
                isLoading={isLoading}
              onBuyNow={(productId) => handleBuyNow(productId, 1)}
            />
          </div>
          {/* Categories and Rating Section at Bottom */}
          <section className="mt-16 mb-8">
            <h2 className="text-2xl font-bold text-[#0E4A22] mb-6 flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-[#EBC351]"></span>Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <div
                className={`bg-white rounded-xl shadow flex flex-col items-center justify-center p-4 min-h-[100px] hover:shadow-lg transition-all cursor-pointer ${selectedCategory === null ? 'ring-2 ring-[#66BF84]' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                <span className="text-[#0E4A22] font-semibold text-lg">All Categories</span>
              </div>
              {Array.from(new Set(products.map(p => p.category))).map((category) => (
                <div
                  key={category}
                  className={`bg-white rounded-xl shadow flex flex-col items-center justify-center p-4 min-h-[100px] hover:shadow-lg transition-all cursor-pointer ${selectedCategory === category ? 'ring-2 ring-[#66BF84]' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="text-[#0E4A22] font-semibold text-lg">{category}</span>
                </div>
              ))}
            </div>
            {/* Rating Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[#0E4A22] font-semibold mr-2">Filter by Rating:</span>
              {[5,4,3,2,1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`flex items-center px-3 py-1 rounded-full border-2 mr-2 ${selectedRating === rating ? 'bg-[#66BF84] border-[#0E4A22] text-white' : 'bg-white border-[#EBC351] text-[#0E4A22]'} transition`}
                >
                  {Array.from({ length: rating }).map((_, i) => (
                    <span key={i} className="text-[#EBC351] text-lg">★</span>
                  ))}
                  <span className="ml-1">& up</span>
                </button>
              ))}
              <button
                onClick={() => setSelectedRating(null)}
                className={`flex items-center px-3 py-1 rounded-full border-2 ${selectedRating === null ? 'bg-[#66BF84] border-[#0E4A22] text-white' : 'bg-white border-[#EBC351] text-[#0E4A22]'} transition`}
              >
                All Ratings
              </button>
          </div>
          </section>
        </div>
        <ProductDetailsModal
          product={selectedProduct}
          products={products}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(productId, qty) => handleAddToCart(productId, qty)}
          onBuyNow={(productId, qty) => handleBuyNow(productId, qty)}
          inventory={selectedProduct ? inventoryData?.find(item => item.product_id === selectedProduct.id) : undefined}
          productRatings={productRatings}
        />
        {/* Dialogs and ErrorModal outside main div for accessibility */}
        {reviewDialogOpen && reviewProduct && (
        <Dialog open={reviewDialogOpen} onOpenChange={(open) => {
          setReviewDialogOpen(open);
        }}>
          <DialogContent className="bg-gradient-to-b from-white to-purple-50 border border-purple-100 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-purple-800">
                {reviewProduct?.isEditing ? "Edit Review" : "Rate & Review"} {reviewProduct?.name}
              </DialogTitle>
                <DialogDescription>
                  {reviewProduct?.isEditing
                    ? "Update your review for this product."
                    : "Share your experience and help others by rating and reviewing this product."}
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4 overflow-y-auto">
              <div className="space-y-4">
                {reviewProduct?.image && (
                  <div className="flex justify-center">
                    <img 
                      src={reviewProduct.image} 
                      alt={reviewProduct.name}
                      className="w-32 h-32 object-cover rounded-md border-2 border-purple-200 shadow-md"
                    />
                  </div>
                )}
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 transition-all duration-300 transform hover:scale-110 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
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
                  className="min-h-[100px] border-purple-200 focus:ring-purple-400"
                />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="review-image">Add Image (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={imageInputRef}
                        id="review-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1 border-purple-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => imageInputRef.current?.click()}
                        className="border-purple-300 text-purple-700"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {previewImage && (
                      <div className="mt-2">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-32 object-cover rounded-md border border-purple-200"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-red-500"
                          onClick={() => {
                            URL.revokeObjectURL(previewImage);
                            setPreviewImage(null);
                            setReviewImage(null);
                            if (imageInputRef.current) imageInputRef.current.value = "";
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review-video">Add Video (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={videoInputRef}
                        id="review-video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="flex-1 border-purple-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => videoInputRef.current?.click()}
                        className="border-purple-300 text-purple-700"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                    {previewVideo && (
                      <div className="mt-2">
                        <video
                          src={previewVideo}
                          controls
                          className="h-32 w-full rounded-md border border-purple-200"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-red-500"
                          onClick={() => {
                            URL.revokeObjectURL(previewVideo);
                            setPreviewVideo(null);
                            setReviewVideo(null);
                            if (videoInputRef.current) videoInputRef.current.value = "";
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <Button 
              onClick={handleSubmitReviewWithMedia} 
              disabled={rating === 0 || isSubmitting} 
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              {isSubmitting ? "Submitting..." : reviewProduct?.isEditing ? "Update Review" : "Submit Review"}
            </Button>
          </DialogContent>
        </Dialog>
        )}
        <ErrorModal
          isOpen={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
            setErrorMessage({ title: "", message: "" });
          }}
          title={errorMessage.title}
          message={errorMessage.message}
        />
      </div>
      <Footer />
    </>
  );
}
