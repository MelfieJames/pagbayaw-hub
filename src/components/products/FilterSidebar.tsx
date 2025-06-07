

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Laptop, Smartphone, Headphones, Camera, Watch, Gamepad2, Home, ShoppingBag } from "lucide-react";
import { Product } from "@/types/product";

interface FilterSidebarProps {
  products: Product[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, { icon: any; color: string }> = {
    'Electronics': { icon: Laptop, color: 'text-blue-600' },
    'Mobile': { icon: Smartphone, color: 'text-purple-600' },
    'Audio': { icon: Headphones, color: 'text-green-600' },
    'Photography': { icon: Camera, color: 'text-red-600' },
    'Wearables': { icon: Watch, color: 'text-orange-600' },
    'Gaming': { icon: Gamepad2, color: 'text-indigo-600' },
    'Home': { icon: Home, color: 'text-yellow-600' },
    'Fashion': { icon: ShoppingBag, color: 'text-pink-600' },
  };
  
  return iconMap[category] || { icon: ShoppingBag, color: 'text-gray-600' };
};

export function FilterSidebar({
  products,
  selectedCategory,
  setSelectedCategory,
  selectedRating,
  setSelectedRating,
}: FilterSidebarProps) {
  const categories = Array.from(new Set(products.map(p => p.category)));
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className={`w-full justify-start ${selectedCategory === null ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {categories.map((category) => {
            const { icon: Icon, color } = getCategoryIcon(category);
            const count = products.filter(p => p.category === category).length;
            
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                className={`w-full justify-between ${selectedCategory === category ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span>{category}</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedRating === null ? "default" : "ghost"}
            className={`w-full justify-start ${selectedRating === null ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
            onClick={() => setSelectedRating(null)}
          >
            All Ratings
          </Button>
          {ratings.map((rating) => (
            <Button
              key={rating}
              variant={selectedRating === rating ? "default" : "ghost"}
              className={`w-full justify-between ${selectedRating === rating ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
              onClick={() => setSelectedRating(rating)}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                {Array.from({ length: 5 - rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-gray-300" />
                ))}
                <span className="ml-1">& up</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

