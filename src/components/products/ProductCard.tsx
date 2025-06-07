
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/services/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { showCartAddNotification } from "./CartAddNotification";

interface ProductCardProps {
  product: Product;
  inventoryData: { product_id: number; quantity: number }[];
  rating?: { total: number; count: number };
  onProductClick?: (product: Product) => void;
}

export function ProductCard({ product, inventoryData, rating, onProductClick }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addToCart = async () => {
    if (!user) {
      toast("Please log in to add items to your cart");
      navigate('/login', {
        state: {
          redirectAfterLogin: '/products',
          message: "Please log in to add items to your cart"
        }
      });
      return;
    }

    const inventoryItem = inventoryData.find(item => item.product_id === product.id);
    if (!inventoryItem || inventoryItem.quantity === 0) {
      toast.error("This item is out of stock");
      return;
    }

    try {
      const { data: existingItem } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > inventoryItem.quantity) {
          toast.error("Cannot exceed available stock");
          return;
        }

        const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          }]);

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['cart-details'] });
      showCartAddNotification(product.product_name);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Failed to add item to cart");
    }
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <Card className="bg-white shadow-md rounded-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">
          {product.product_name}
        </CardTitle>
        <CardDescription>Category: {product.category}</CardDescription>
        {rating && rating.count > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow-500">★</span>
            <span className="text-sm text-gray-600">
              {(rating.total / rating.count).toFixed(1)} ({rating.count} reviews)
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.product_name}
          className="w-full h-48 object-cover rounded-md mb-3"
        />
        <p className="text-gray-700">
          Price: ₱{product.product_price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center items-center p-4">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            addToCart();
          }} 
          className="bg-green-600 text-white rounded-md hover:bg-green-500 w-full"
        >
          Add to Cart <ShoppingCart className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
