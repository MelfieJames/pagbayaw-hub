
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Product } from "@/types/product";
import { Star, Package, ShoppingBag } from "lucide-react";

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

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= averageRating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-300 text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-green-200/50 hover:border-green-300/70 h-[320px] group mb-4" onClick={handleCardClick}>
      <CardContent className="p-4 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative mb-3 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.product_name}
            className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm rounded-full p-1.5">
            <Package className="h-4 w-4 text-white" />
          </div>
        </div>
        
        {/* Star Rating and Price Row */}
        <div className="flex justify-between items-center mb-3">
          {/* 5 Star Rating */}
          <div className="flex items-center gap-1">
            {renderStars()}
            {rating && rating.count > 0 && (
              <span className="text-xs text-gray-500 ml-1">({rating.count})</span>
            )}
          </div>
          
          {/* Price with shopping bag icon */}
          <div className="flex items-center gap-1 bg-green-100/80 rounded-full px-2 py-1">
            <ShoppingBag className="h-3 w-3 text-green-600" />
            <span className="text-sm font-bold text-green-700">
              ₱{product.product_price.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Product Name at Bottom */}
        <div className="mt-auto">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-5 group-hover:text-green-700 transition-colors">
            {product.product_name}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
