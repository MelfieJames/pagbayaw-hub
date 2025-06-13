
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AdminReviewsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: string;
  setSelectedProduct: (productId: string) => void;
  products: any[];
  getReviewCount: (productId: number) => number;
}

export function AdminReviewsFilters({
  searchQuery,
  setSearchQuery,
  selectedProduct,
  setSelectedProduct,
  products,
  getReviewCount
}: AdminReviewsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by product, user, or review content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <select
        value={selectedProduct}
        onChange={(e) => setSelectedProduct(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white"
      >
        <option value="all">All Products</option>
        {products.map(product => (
          <option key={product.id} value={product.id.toString()}>
            {product.product_name} ({getReviewCount(product.id)} reviews)
          </option>
        ))}
      </select>
    </div>
  );
}
