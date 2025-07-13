
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
  onBuyNow?: (productId: number) => void;
}

export function ProductCard({ product, inventoryData, rating, onProductClick, onBuyNow }: ProductCardProps) {
  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <Card className="bg-white shadow rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center group mb-4 border-none outline-none" style={{ border: 'none', outline: 'none' }} onClick={handleCardClick}>
      <CardContent className="p-4 h-full flex flex-col items-center justify-center">
        {/* Product Image */}
        <div className="mb-4 flex-shrink-0 overflow-hidden rounded-lg w-28 h-28 flex items-center justify-center bg-[#F8F8F3] border-none outline-none group-hover:scale-110 transition-transform duration-300" style={{ border: 'none', outline: 'none' }}>
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.product_name}
            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        {/* Product Name */}
        <h3 className="text-base font-semibold text-[#0E4A22] text-center mb-2 break-words whitespace-normal group-hover:text-[#66BF84] group-hover:scale-105 transition-all duration-300" style={{ minHeight: '2.5em' }}>
          {product.product_name}
        </h3>
        {/* Price */}
        <div className="flex items-center justify-center mb-3">
          <span className="text-lg font-bold text-black break-words">
            ₱{product.product_price.toFixed(2)}
          </span>
        </div>
        {/* Buy Now Button */}
        {onBuyNow && (
          <button
            className="mt-2 w-full border-2 border-[#66BF84] text-[#0E4A22] font-semibold rounded-lg bg-white hover:bg-[#66BF84] hover:text-white transition px-4 py-2 hover:scale-105 focus:scale-105 active:scale-100 duration-200"
            onClick={e => { e.stopPropagation(); onBuyNow(product.id); }}
          >
            Buy Now
          </button>
        )}
      </CardContent>
    </Card>
  );
}
