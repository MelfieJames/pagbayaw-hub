import Navbar from "@/components/Navbar";
import { supabase } from "@/services/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Heart, HeartOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { CartPopover } from "@/components/products/CartPopover";
import { WishlistPopover } from "@/components/products/WishlistPopover";

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

const Products = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: products, isLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

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
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('cart')
        .select('product_id, quantity')
        .eq('user_id', user.id);

      if (error) {
        console.error('Cart fetch error:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);

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
    return matchesSearch && matchesCategory;
  });

  const groupedProducts = filteredProducts?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>) || {};

  const calculateTotal = () => {
    return filteredProducts
      ?.filter(product => selectedItems.includes(product.id))
      .reduce((total, product) => {
        const cartItem = cartItems.find(item => item.product_id === product.id);
        return total + (product.product_price * (cartItem?.quantity || 1));
      }, 0) || 0;
  };

  const toggleItemSelection = (productId: number) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a purchase",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to purchase",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Proceeding to checkout",
      description: `Total amount: ₱${calculateTotal().toFixed(2)}`,
    });
  };

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (!user?.id) throw new Error('Must be logged in');
      
      try {
        const { data: existingItem, error: fetchError } = await supabase
          .from('cart')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingItem) {
          const { error } = await supabase
            .from('cart')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('user_id', user.id)
            .eq('product_id', productId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('cart')
            .insert({ user_id: user.id, product_id: productId, quantity });
          if (error) throw error;
        }
      } catch (error) {
        console.error('Cart mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({ title: "Added to cart" });
    },
    onError: (error: Error) => {
      if (error.message.includes('Must be logged in')) {
        navigate('/login');
        toast({ 
          title: "Please log in", 
          description: "You need to be logged in to add items to your cart",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Error", 
          description: error.message,
          variant: "destructive" 
        });
      }
    }
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!user) throw new Error('Must be logged in');
      const isInWishlist = wishlistItems.some(item => item.product_id === productId);
      
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({ title: "Wishlist updated" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your cart",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  const handleToggleWishlist = (product: Product) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your wishlist",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    toggleWishlistMutation.mutate(product.id);
  };

  if (productsError) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load products</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 container mx-auto">
          <h1 className="text-4xl font-bold text-center">Products</h1>
          <div className="text-center mt-8">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>
        
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "secondary" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="mb-8 p-4 bg-secondary rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Selected Items: {selectedItems.length}</p>
                <p className="text-2xl font-bold">Total: ₱{calculateTotal().toFixed(2)}</p>
              </div>
              <Button onClick={handleBuyNow}>Buy Now</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts?.map((product) => {
            const isInWishlist = wishlistItems.some(item => item.product_id === product.id);
            const cartItem = cartItems.find(item => item.product_id === product.id);
            const isSelected = selectedItems.includes(product.id);
            
            return (
              <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  {user && (
                    <>
                      <CartPopover 
                        isInCart={!!cartItem}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                      <WishlistPopover
                        isInWishlist={isInWishlist}
                        onToggleWishlist={() => handleToggleWishlist(product)}
                      />
                    </>
                  )}
                </div>
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleItemSelection(product.id)}
                  />
                </div>
                <div 
                  className="aspect-w-16 aspect-h-9 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.product_name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{product.product_name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{product.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">₱{product.product_price.toFixed(2)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-3xl">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedProduct.product_name}</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={selectedProduct.image || "/placeholder.svg"}
                      alt={selectedProduct.product_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <Badge variant="secondary">{selectedProduct.category}</Badge>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                    <p className="text-2xl font-bold">₱{selectedProduct.product_price.toFixed(2)}</p>
                  </div>
                </div>
                <DialogFooter className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleWishlist(selectedProduct)}
                    className="flex-1"
                  >
                    {wishlistItems.some(item => item.product_id === selectedProduct.id) ? (
                      <>
                        <HeartOff className="mr-2 h-4 w-4" />
                        Remove from Wishlist
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Add to Wishlist
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Products;
