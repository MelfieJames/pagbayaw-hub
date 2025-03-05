
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  inventory: { quantity: number } | undefined;
  rating?: { total: number; count: number };
  onProductClick: () => void;
}

export function ProductCard({ product, inventory, rating, onProductClick }: ProductCardProps) {
  const isOutOfStock = inventory?.quantity === 0;
  const averageRating = rating && rating.count > 0 ? rating.total / rating.count : 0;

  return (
    <Card
      onClick={onProductClick}
      className={`relative overflow-hidden transition-all ${
        isOutOfStock 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-lg cursor-pointer'
      }`}
      data-product-id={product.id}
    >
      <div className="aspect-square relative">
        <img 
          src={product.image || "/placeholder.svg"} 
          alt={product.product_name} 
          className={`w-full h-full object-cover ${isOutOfStock ? 'blur-[2px]' : ''}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="space-y-1">
        <Badge variant="secondary" className="w-fit">
          {product.category}
        </Badge>
        <CardTitle className="text-lg">{product.product_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span>₱{product.product_price.toFixed(2)}</span>
          <div className="flex flex-col items-end gap-1">
            {rating && (
              <span className="text-xs flex items-center gap-1">
                {rating.count > 0 ? averageRating.toFixed(1) : "0.0"}
                <Star className={`h-3 w-3 ${rating.count > 0 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ({rating.count})
              </span>
            )}
            <span className="text-xs">
              {inventory?.quantity || 0} available
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
