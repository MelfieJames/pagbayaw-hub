
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { SimilarProducts } from "./SimilarProducts";
import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsModalProps {
  product: Product | null;
  products: Product[];
  onClose: () => void;
  onAddToCart: (productId: number, quantity: number) => void;
  onBuyNow: (productId: number) => void;
  inventory: { quantity: number } | undefined;
}

export function ProductDetailsModal({
  product,
  products,
  onClose,
  onAddToCart,
  onBuyNow,
  inventory,
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const stockQuantity = inventory?.quantity ?? 0;
  const isOutOfStock = stockQuantity === 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.product_name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <ProductImageCarousel
            mainImage={product.image}
            productName={product.product_name}
            isOutOfStock={isOutOfStock}
          />
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <p className="text-2xl font-bold">₱{product.product_price.toFixed(2)}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>

            {!isOutOfStock && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Quantity</p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {stockQuantity} pieces available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!isOutOfStock && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onBuyNow(product.id)}
            >
              Buy Now
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => onAddToCart(product.id, quantity)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </DialogFooter>
        )}

        <SimilarProducts
          products={products}
          currentProductId={product.id}
          category={product.category}
          onProductClick={(newProduct) => {
            onClose();
            setTimeout(() => {
              // Open the new product modal after the current one closes
              const element = document.querySelector(`[data-product-id="${newProduct.id}"]`);
              element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }, 300);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
