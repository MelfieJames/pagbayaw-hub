
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { Product } from "@/types/product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProductCard } from "@/components/products/ProductCard";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { CartPopover } from "@/components/products/CartPopover";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

export default function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: productReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(email),
          products(product_name, image)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleBuyNow = async (productId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase items"
      });
      navigate("/login");
      return;
    }

    try {
      const product = products?.find(p => p.id === productId);
      if (!product) return;

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          total_amount: product.product_price,
          status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      const { error: itemError } = await supabase
        .from('purchase_items')
        .insert({
          purchase_id: purchase.id,
          product_id: productId,
          quantity: 1,
          price_at_time: product.product_price
        });

      if (itemError) throw itemError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          purchase_id: purchase.id,
          type: 'purchase',
          message: `Your order for ${product.product_name} has been placed and is pending confirmation.`
        });

      if (notificationError) throw notificationError;

      navigate("/checkout", { state: { selectedItems: [productId] } });
      
      toast({
        title: "Order Processed",
        description: "Your order has been successfully processed.",
      });
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart"
      });
      navigate("/login");
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      toast({
        title: "Success",
        description: "Item added to cart"
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  const getInventoryForProduct = (productId: number) => {
    return inventoryData?.find(item => item.product_id === productId);
  };

  const productRatings = productReviews.reduce((acc, review) => {
    if (!acc[review.product_id]) {
      acc[review.product_id] = { total: 0, count: 0 };
    }
    acc[review.product_id].total += review.rating;
    acc[review.product_id].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FilterSidebar
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 mr-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by product name or category..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <CartPopover />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products
                .filter(product => {
                  const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     product.category.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = !selectedCategory || product.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                })
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inventory={getInventoryForProduct(product.id)}
                    rating={productRatings[product.id]}
                    onProductClick={() => setSelectedProduct(product)}
                  />
                ))}
            </div>
          </div>
        </div>

        <ProductDetailsModal
          product={selectedProduct}
          products={products}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          inventory={selectedProduct ? getInventoryForProduct(selectedProduct.id) : undefined}
          productRatings={productRatings}
        />
      </div>
    </div>
  );
}
