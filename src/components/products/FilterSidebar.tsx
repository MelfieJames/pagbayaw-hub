
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Product } from "@/types/product";

interface FilterSidebarProps {
  products: Product[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
}

export function FilterSidebar({ 
  products, 
  selectedCategory, 
  setSelectedCategory,
  selectedRating,
  setSelectedRating
}: FilterSidebarProps) {
  const categories = [...new Set(products.map(product => product.category))];

  return (
    <div className="space-y-6">
      <div className="sticky top-24">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Category</h2>
          <div className="space-y-2">
            <Button 
              variant={selectedCategory === null ? "secondary" : "outline"} 
              onClick={() => setSelectedCategory(null)}
              className="w-full justify-start"
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="w-full justify-start"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Customer Reviews</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={selectedRating === rating ? "secondary" : "outline"}
                onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                className="w-full justify-start flex items-center"
              >
                <div className="flex items-center space-x-1">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array(5 - rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                  <span className="ml-2">& up</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
