import Navbar from "@/components/Navbar";
import { supabase } from "@/services/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Star, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CartPopover } from "@/components/products/CartPopover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ReviewsModal } from "@/components/products/ReviewsModal";
import { ReviewSection } from "@/components/products/ReviewSection";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  image: string | null;
  category: string;
  product_name: string;
  description: string;
  product_price: number;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  status: string | null;
  featured: boolean | null;
  tags: string[] | null;
}

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₱100', min: 0, max: 100 },
  { label: 'Under ₱200', min: 0, max: 200 },
  { label: 'Under ₱300', min: 0, max: 300 },
  { label: 'Under ₱500', min: 0, max: 500 },
  { label: '₱500 and above', min: 500, max: Infinity }
];

export default function Products() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showReviews, setShowReviews] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const {
    data: products,
    isLoading,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('products').select('*').order('created_at', {
          ascending: false
        });
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        if (!data) {
          return [];
        }
        return data as Product[];
      } catch (error) {
        console.error('Failed to fetch products:', error);
        throw new Error('Failed to load products. Please try again later.');
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity
    }: {
      productId: number;
      quantity: number;
    }) => {
      if (!user?.id) throw new Error('User must be logged in');
      const {
        error
      } = await supabase.from('cart').upsert({
        user_id: user.id,
        product_id: productId,
        quantity
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart-details']
      });
      toast({
        title: "Success",
        description: "Item added to cart"
      });
    },
    onError: error => {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  });

  const {
    data: cartItems = []
  } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('cart').select('product_id, quantity').eq('user_id', user.id);
      if (error) {
        console.error('Cart fetch error:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  const {
    data: wishlistItems = []
  } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!user) return [];
      const {
        data,
        error
      } = await supabase.from('wishlist').select('product_id').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const categories = products ? [...new Set(products.map(product => product.category))] : [];

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesPrice = product.product_price >= selectedPriceRange.min && 
                        product.product_price <= selectedPriceRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleRatingSubmit = () => {
    if (!user || !selectedProduct) return;
    addReviewMutation.mutate({
      productId: selectedProduct.id,
      rating,
      comment: review || undefined
    });
  };

  const toggleItemSelection = (productId: number) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBuyNow = (productId: number) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to purchase items",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 }, {
      onSuccess: () => navigate("/checkout")
    });
  };

  const { data: productReviews = [] } = useQuery({
    queryKey: ['reviews', selectedProduct?.id],
    queryFn: async () => {
      if (!selectedProduct?.id) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(email)')
        .eq('product_id', selectedProduct.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProduct?.id
  });

  const addReviewMutation = useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: number, rating: number, comment?: string }) => {
      if (!user?.id) throw new Error('Must be logged in to review');
      const { error } = await supabase
        .from('reviews')
        .upsert({
          user_id: user.id,
          product_id: productId,
          rating,
          comment: comment || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      toast({
        title: "Thank you!",
        description: `Thank you for reviewing ${selectedProduct?.product_name}.`,
      });
      setRating(0);
      setReview("");
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(email),
          products(
            product_name,
            category,
            image
          )
        `)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    }
  });

  const handleAddToCart = (productId: number) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your cart",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    addToCartMutation.mutate({
      productId: productId,
      quantity: 1
    });
    setSelectedProduct(null);
  };

  const productRatings = (allReviews || []).reduce((acc, review) => {
    if (!acc[review.product_id]) {
      acc[review.product_id] = {
        total: 0,
        count: 0
      };
    }
    acc[review.product_id].total += review.rating;
    acc[review.product_id].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const getInventoryForProduct = (productId: number) => {
    return inventoryData?.find(item => item.product_id === productId);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Category</h2>
              <div className="space-y-2">
                <Button 
                  variant={selectedCategory === null ? "secondary" : "outline"} 
                  onClick={() => setSelectedCategory(null)}
                  className="w-full justify-start"
                >
                  All Categories
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "secondary" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="w-full justify-start"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Price Range</h2>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant={selectedPriceRange === range ? "secondary" : "outline"}
                    onClick={() => setSelectedPriceRange(range)}
                    className="w-full justify-start"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Customer Reviews</h2>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-1 text-muted-foreground">
                    {Array(rating).fill(0).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    <span>& up</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 mr-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <CartPopover />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts?.map((product) => {
                const inventory = getInventoryForProduct(product.id);
                const isOutOfStock = inventory?.quantity === 0;

                return (
                  <Card 
                    key={product.id}
                    data-product-id={product.id}
                    className={cn(
                      "relative overflow-hidden transition-shadow",
                      !isOutOfStock && "hover:shadow-lg cursor-pointer"
                    )}
                    onClick={() => !isOutOfStock && setSelectedProduct(product)}
                  >
                    <div className="aspect-square">
                      <img 
                        src={product.image || "/placeholder.svg"} 
                        alt={product.product_name} 
                        className={cn(
                          "w-full h-full object-cover",
                          isOutOfStock && "blur-[2px] brightness-90"
                        )}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/60 text-white px-4 py-2 rounded-md font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <CardHeader className="space-y-1">
                      <Badge variant="secondary" className="w-fit">
                        {product.category}
                      </Badge>
                      <CardTitle className="text-lg">{product.product_name}</CardTitle>
                      <CardDescription>₱{product.product_price.toFixed(2)}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <ProductDetailsModal
          product={selectedProduct}
          products={products || []}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(productId, quantity) => {
            handleAddToCart(productId);
            setSelectedProduct(null);
          }}
          onBuyNow={handleBuyNow}
          inventory={selectedProduct ? getInventoryForProduct(selectedProduct.id) : undefined}
        />
      </div>
    </div>
  );
}
