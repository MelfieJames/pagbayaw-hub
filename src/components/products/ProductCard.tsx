
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Product } from "@/types/product";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  inventoryData: { product_id: number; quantity: number }[];
  rating?: { total: number; count: number };
  onProductClick?: (product: Product) => void;
}

export function ProductCard({ product, inventoryData, rating, onProductClick }: ProductCardProps) {
  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const averageRating = rating && rating.count > 0 ? (rating.total / rating.count) : 0;
  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : "0.0";

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-200 h-[280px]" onClick={handleCardClick}>
      <CardContent className="p-4 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative mb-3 flex-shrink-0">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.product_name}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
        
        {/* Rating and Price Row */}
        <div className="flex justify-between items-center mb-3">
          {/* Star Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{displayRating}</span>
            {rating && rating.count > 0 && (
              <span className="text-xs text-gray-500">({rating.count})</span>
            )}
          </div>
          
          {/* Price */}
          <div className="text-lg font-bold text-green-600">
            ₱{product.product_price.toFixed(2)}
          </div>
        </div>
        
        {/* Product Name at Bottom */}
        <div className="mt-auto">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-5">
            {product.product_name}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
