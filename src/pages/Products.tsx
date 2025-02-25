
import { useState } from "react";
import { Product } from "@/types/product";
import { ProductList } from "@/components/products/ProductList";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { SearchBar } from "@/components/products/SearchBar";
import Navbar from "@/components/Navbar";
import { useProductQueries } from "@/hooks/products/useProductQueries";
import { useProductActions } from "@/hooks/products/useProductActions";

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { products, inventoryData, productReviews } = useProductQueries();
  const { handleBuyNow, handleAddToCart } = useProductActions();

  const productRatings = productReviews.reduce((acc, review) => {
    if (!acc[review.product_id]) {
      acc[review.product_id] = { total: 0, count: 0 };
    }
    acc[review.product_id].total += review.rating;
    acc[review.product_id].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FilterSidebar
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="md:col-span-3">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <ProductList
              products={products}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              inventoryData={inventoryData || []}
              productRatings={productRatings}
              onProductClick={setSelectedProduct}
            />
          </div>
        </div>

        <ProductDetailsModal
          product={selectedProduct}
          products={products}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={(productId) => handleBuyNow(productId)}
          inventory={selectedProduct ? inventoryData?.find(item => item.product_id === selectedProduct.id) : undefined}
          productRatings={productRatings}
        />
      </div>
    </div>
  );
}
