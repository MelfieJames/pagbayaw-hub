
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";

interface SimilarProductsProps {
  products: Product[];
  currentProductId: number;
  category: string;
  onProductClick: (product: Product) => void;
}

export function SimilarProducts({ products, currentProductId, category, onProductClick }: SimilarProductsProps) {
  const similarProducts = products
    .filter(p => p.category === category && p.id !== currentProductId)
    .slice(0, 6);

  if (similarProducts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {similarProducts.map((product) => (
        <Card 
          key={product.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onProductClick(product)}
        >
          <div className="aspect-square">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader className="p-3">
            <CardTitle className="text-sm truncate">{product.product_name}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground">
              ₱{product.product_price.toFixed(2)}
            </p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
