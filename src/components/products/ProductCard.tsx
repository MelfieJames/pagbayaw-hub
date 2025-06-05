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
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { showCartAddNotification } from "./CartAddNotification";

interface ProductCardProps {
  product: Product;
  inventoryData: any[];
}

export function ProductCard({ product, inventoryData }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', product.id);

          if (error) {
            console.error('Error fetching favorite status:', error);
          } else {
            setIsFavorite(data && data.length > 0);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkFavoriteStatus();
  }, [user, product.id]);

  const toggleFavorite = async () => {
    if (!user) {
      toast("Please log in to add items to your favorites");
      navigate('/login', {
        state: {
          redirectAfterLogin: '/products',
          message: "Please log in to add items to your favorites"
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) {
          console.error('Error removing from favorites:', error);
          toast.error("Failed to remove from favorites");
        } else {
          setIsFavorite(false);
          toast.success("Removed from favorites");
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{
            user_id: user.id,
            product_id: product.id
          }]);

        if (error) {
          console.error('Error adding to favorites:', error);
          toast.error("Failed to add to favorites");
        } else {
          setIsFavorite(true);
          toast.success("Added to favorites");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <Card className="bg-white shadow-md rounded-md overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">
          {product.product_name}
        </CardTitle>
        <CardDescription>Category: {product.category}</CardDescription>
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
      <CardFooter className="flex justify-between items-center p-4">
        <Button onClick={addToCart} className="bg-green-600 text-white rounded-md hover:bg-green-500">
          Add to Cart <ShoppingCart className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={toggleFavorite}
          disabled={isLoading}
          className={`rounded-full p-2 hover:bg-gray-100 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Heart className="h-5 w-5" fill={isFavorite ? 'red' : 'none'} stroke={isFavorite ? 'none' : 'currentColor'} />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
