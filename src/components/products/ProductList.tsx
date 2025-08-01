
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ProductListProps {
  products: Product[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedRating: number | null;
  inventoryData: { product_id: number; quantity: number }[];
  productRatings: Record<number, { total: number; count: number }>;
  onProductClick: (product: Product) => void;
  isLoading?: boolean;
  onBuyNow?: (productId: number) => void;
}

export function ProductList({
  products,
  searchQuery,
  selectedCategory,
  selectedRating,
  inventoryData,
  productRatings,
  onProductClick,
  isLoading = false,
  onBuyNow,
}: ProductListProps) {
  // Filter products based on search query, selected category, and rating
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
      
    const matchesRating = !selectedRating || 
      (productRatings[product.id] && 
       (productRatings[product.id].total / productRatings[product.id].count) >= selectedRating);

    return matchesSearch && matchesCategory && matchesRating;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-transparent border-none outline-none" style={{ background: 'transparent', border: 'none', outline: 'none' }}>
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          inventoryData={inventoryData}
          rating={productRatings[product.id]}
          onProductClick={() => onProductClick(product)}
          onBuyNow={onBuyNow}
        />
      ))}
    </div>
  );
}
