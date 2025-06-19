
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AdminReviewsFiltersProps {
  filters: {
    rating: string;
    product: string;
    sortBy: string;
  };
  onFiltersChange: (filters: { rating: string; product: string; sortBy: string }) => void;
  products: Array<{
    id: number;
    product_name: string;
    image: string | null;
  }>;
}

export default function AdminReviewsFilters({ filters, onFiltersChange, products }: AdminReviewsFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" values back to empty strings for filtering logic
    const filterValue = value === "all" ? "" : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rating Filter */}
        <div className="space-y-2">
          <Label htmlFor="rating-filter">Filter by Rating</Label>
          <Select
            value={filters.rating || "all"}
            onValueChange={(value) => handleFilterChange('rating', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Filter */}
        <div className="space-y-2">
          <Label htmlFor="product-filter">Filter by Product</Label>
          <Select
            value={filters.product || "all"}
            onValueChange={(value) => handleFilterChange('product', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.product_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <Label htmlFor="sort-filter">Sort by</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest_rating">Highest rating</SelectItem>
              <SelectItem value="lowest_rating">Lowest rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
