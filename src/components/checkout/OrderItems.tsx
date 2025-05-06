
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types/product";

interface OrderItemsProps {
  cartItems: CartItem[];
  inventoryData: any[];
  updateQuantity: (productId: number, newQuantity: number) => void;
  removeFromCart: (productId: number) => void;
}

export default function OrderItems({
  cartItems,
  inventoryData,
  updateQuantity,
  removeFromCart
}: OrderItemsProps) {
  const getMaxQuantity = (productId: number) => {
    const inventoryItem = inventoryData.find(item => item.product_id === productId);
    return inventoryItem?.quantity || 0;
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-medium">Order Items ({cartItems.length})</h2>
      </div>
      
      <div className="divide-y">
        {cartItems.map((item) => (
          <div key={item.product_id} className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0">
              <img 
                src={item.products?.image || "/placeholder.svg"}
                alt={item.products?.product_name}
                className="w-20 h-20 object-cover rounded-md"
              />
            </div>
            
            <div className="flex-grow min-w-0">
              <h3 className="font-medium truncate">{item.products?.product_name}</h3>
              <p className="text-gray-500 text-sm mt-1">
                Unit Price: ₱{item.products?.product_price.toFixed(2)}
              </p>
              
              <div className="mt-3 flex items-center">
                <div className="flex items-center border rounded overflow-hidden">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.product_id, item.quantity - 1);
                      }
                    }}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="1"
                    max={getMaxQuantity(item.product_id)}
                    className="w-12 h-8 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0 && value <= getMaxQuantity(item.product_id)) {
                        updateQuantity(item.product_id, value);
                      }
                    }}
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      if (item.quantity < getMaxQuantity(item.product_id)) {
                        updateQuantity(item.product_id, item.quantity + 1);
                      }
                    }}
                    disabled={item.quantity >= getMaxQuantity(item.product_id)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="ml-2 text-sm text-gray-600">
                  {getMaxQuantity(item.product_id) > 0 ? (
                    <span>{getMaxQuantity(item.product_id)} in stock</span>
                  ) : (
                    <span className="text-red-500">Out of stock</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between">
              <div className="font-medium">
                ₱{(item.quantity * (item.products?.product_price || 0)).toFixed(2)}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={() => removeFromCart(item.product_id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
