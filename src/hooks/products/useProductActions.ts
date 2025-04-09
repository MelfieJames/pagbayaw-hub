import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function useProductActions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuyNow = async (productId: number, quantity: number = 1) => {
    if (!user) {
      toast("Please log in to purchase items");
      navigate("/login", { 
        state: { 
          redirectAfterLogin: "/products",
          message: "Please log in to continue with your purchase."
        } 
      });
      return;
    }

    try {
      console.log("Buy Now for product:", productId, "quantity:", quantity);
      
      // Get inventory quantity first
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .maybeSingle();

      if (inventoryError) {
        console.error("Inventory check error:", inventoryError);
        throw inventoryError;
      }

      if (!inventoryData || inventoryData.quantity < quantity) {
        toast("Not enough items in stock");
        return;
      }

      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();
        
      if (productError) {
        console.error("Product fetch error:", productError);
        throw productError;
      }

      // Create a temporary cart item in the query cache
      const buyNowItems = [{
        quantity: quantity,
        product_id: productId,
        products: {
          product_name: product.product_name,
          product_price: product.product_price,
          image: product.image,
          category: product.category
        }
      }];

      // Set this data in the query cache for the checkout page to use
      queryClient.setQueryData(['checkout-items'], buyNowItems);

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      console.error('Error processing buy now:', error);
      toast("Failed to process buy now request");
    }
  };

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      toast("Please log in to add items to cart");
      navigate("/login", { 
        state: { 
          redirectAfterLogin: "/products",
          message: "Please log in to add items to your cart."
        } 
      });
      return;
    }

    try {
      console.log("Adding to cart product:", productId, "quantity:", quantity);
      
      // Get inventory quantity first
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .maybeSingle();

      if (inventoryError) {
        console.error("Inventory check error:", inventoryError);
        throw inventoryError;
      }

      if (!inventoryData || inventoryData.quantity < 1) {
        toast("Item is out of stock");
        return;
      }

      // Check existing cart quantity
      const { data: existingItem, error: checkError } = await supabase
        .from('cart')
        .select('quantity, id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Cart check error:", checkError);
        throw checkError;
      }

      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Ensure we don't exceed inventory
      if (newQuantity > inventoryData.quantity) {
        toast("Cannot exceed available stock");
        return;
      }

      // Fixed approach: separate insert and update operations
      if (existingItem) {
        // Update existing cart item
        console.log("Updating existing cart item with quantity:", newQuantity);
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error("Cart update error:", updateError);
          throw updateError;
        }
      } else {
        // Insert new cart item
        console.log("Inserting new cart item with quantity:", newQuantity);
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: newQuantity
          });

        if (insertError) {
          console.error("Cart insert error:", insertError);
          throw insertError;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      toast("Item added to cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast("Failed to add item to cart");
    }
  };

  const handleSubmitReview = async (productId: number, rating: number, comment: string, reviewId?: number, mediaFiles?: { image?: File, video?: File }) => {
    if (!user) {
      toast("Please log in to submit a review");
      navigate("/login", { 
        state: { 
          redirectAfterLogin: `/products`,
          message: "Please log in to submit a review."
        } 
      });
      return false;
    }

    try {
      setIsSubmitting(true);
      
      let imageUrl = null;
      let videoUrl = null;

      // Upload media files if provided
      if (mediaFiles) {
        if (mediaFiles.image) {
          const fileExt = mediaFiles.image.name.split('.').pop();
          const filePath = `reviews/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, mediaFiles.image);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error('Error uploading image');
          }

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        if (mediaFiles.video) {
          const fileExt = mediaFiles.video.name.split('.').pop();
          const filePath = `reviews/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, mediaFiles.video);

          if (uploadError) {
            console.error('Error uploading video:', uploadError);
            throw new Error('Error uploading video');
          }

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          videoUrl = publicUrl;
        }
      }
      
      if (reviewId) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
            image_url: imageUrl || undefined,
            video_url: videoUrl || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewId);

        if (error) {
          console.error("Error updating review:", error);
          toast("Failed to update review: " + error.message);
          return false;
        }

        toast("Review updated successfully");
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            product_id: productId,
            rating,
            comment,
            image_url: imageUrl || undefined,
            video_url: videoUrl || undefined
          });

        if (error) {
          console.error("Error submitting review:", error);
          toast("Failed to submit review: " + error.message);
          return false;
        }

        toast("Review submitted successfully");
      }
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', user.id] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews', user.id] });
      
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast("Failed to submit review");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!user) {
      toast("Please log in to delete a review");
      navigate("/login", { 
        state: { 
          redirectAfterLogin: `/my-ratings`,
          message: "Please log in to manage your reviews."
        } 
      });
      return false;
    }

    try {
      setIsSubmitting(true);
      await deleteReview(reviewId);
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', user.id] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews', user.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      
      toast("Review deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      toast("Failed to delete review");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    if (!user) {
      navigate("/login", { 
        state: { 
          redirectAfterLogin: "/",
          message: "Please log in to view notifications."
        } 
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      // Invalidate notifications query to update UI
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Add the deleteReview function since it was removed from imports
  const deleteReview = async (reviewId: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
        
      if (error) {
        console.error('Error deleting review:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteReview:', error);
      throw error;
    }
  };

  return {
    handleBuyNow,
    handleAddToCart,
    handleSubmitReview,
    handleDeleteReview,
    isSubmitting,
    markNotificationAsRead
  };
}
