
import Navbar from "@/components/Navbar";
import { supabase } from "@/services/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const { toast } = useToast();
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    }
  });

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

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load products. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.product_name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{product.product_name}</CardTitle>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">{product.description}</p>
              </CardContent>
              <CardFooter>
                <p className="text-xl font-bold">${product.product_price.toFixed(2)}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
