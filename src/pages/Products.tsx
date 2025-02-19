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
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
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
  return <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>
        
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground mx-[240px]" />
              <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-green-50 rounded-2xl py-0 mx-[240px] my-0 px-[41px]" />
            </div>
            <CartPopover />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant={selectedCategory === null ? "secondary" : "outline"} onClick={() => setSelectedCategory(null)}>
              All
            </Button>
            {categories.map(category => <Button key={category} variant={selectedCategory === category ? "secondary" : "outline"} onClick={() => setSelectedCategory(category)}>
                {category}
              </Button>)}
          </div>
        </div>

        {Object.entries(groupedProducts).map(([category, categoryProducts]) => <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map(product => <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.image || "/placeholder.svg"} alt={product.product_name} className="w-full h-48 object-cover" />
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
                </Card>)}
            </div>
          </div>)}

        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-3xl">
            {selectedProduct && <>
                <DialogHeader>
                  <DialogTitle>{selectedProduct.product_name}</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-w-16 aspect-h-9">
                    <img src={selectedProduct.image || "/placeholder.svg"} alt={selectedProduct.product_name} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="space-y-4">
                    <Badge variant="secondary">{selectedProduct.category}</Badge>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                    <p className="text-2xl font-bold">₱{selectedProduct.product_price.toFixed(2)}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full" onClick={() => {
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
                  productId: selectedProduct.id,
                  quantity: 1
                });
                setSelectedProduct(null);
              }}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </DialogFooter>
              </>}
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default Products;