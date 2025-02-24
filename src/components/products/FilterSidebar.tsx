
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Product } from "@/types/product";

interface FilterSidebarProps {
  products: Product[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export function FilterSidebar({ products, selectedCategory, setSelectedCategory }: FilterSidebarProps) {
  const categories = [...new Set(products.map(product => product.category))];

  return (
    <div className="space-y-6">
      <div className="sticky top-24">
        <div>
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
              <div key={rating} className="flex items-center space-x-1 text-muted-foreground">
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span>& up</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
