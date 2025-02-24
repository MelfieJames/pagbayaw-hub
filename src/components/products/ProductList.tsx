
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  products: Product[];
  searchQuery?: string;
  selectedCategory?: string | null;
  inventoryData?: any[];
  productRatings?: Record<number, { total: number; count: number }>;
  onProductClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export function ProductList({ 
  products,
  searchQuery = "",
  selectedCategory = null,
  inventoryData = [],
  productRatings = {},
  onProductClick,
  onEdit,
  onDelete
}: ProductListProps) {
  const getInventoryForProduct = (productId: number) => {
    return inventoryData?.find(item => item.product_id === productId);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          inventory={getInventoryForProduct(product.id)}
          rating={productRatings[product.id]}
          onProductClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
}
