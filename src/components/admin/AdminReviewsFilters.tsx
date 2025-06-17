
import { Input } from "@/components/ui/input";
import { Search, Filter, Star } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface AdminReviewsFiltersProps {
  filters: {
    rating: string;
    product: string;
    sortBy: string;
  };
  onFiltersChange: Dispatch<SetStateAction<{
    rating: string;
    product: string;
    sortBy: string;
  }>>;
  products: any[];
}

export function AdminReviewsFilters({
  filters,
  onFiltersChange,
  products
}: AdminReviewsFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-[#8B7355]" />
        <h3 className="text-lg font-semibold text-[#8B7355]">Filter Reviews</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rating Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Star className="h-4 w-4" />
            Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => onFiltersChange(prev => ({ ...prev, rating: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Product Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Product</label>
          <select
            value={filters.product}
            onChange={(e) => onFiltersChange(prev => ({ ...prev, product: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product.id} value={product.id.toString()}>
                {product.product_name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange(prev => ({ ...prev, sortBy: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
