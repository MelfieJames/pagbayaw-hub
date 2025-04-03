
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/types/product";
import { MinusCircle, PlusCircle, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface OrderItemsProps {
  cartItems: CartItem[];
  inventoryData: any[];
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
}

export default function OrderItems({
  cartItems,
  inventoryData,
  updateQuantity,
  removeFromCart
}: OrderItemsProps) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-800">
        <ShoppingBag className="h-5 w-5 text-primary" /> Order Items
      </h2>
      
      <ScrollArea className="h-[calc(100vh-400px)] pr-4">
        {cartItems.map((item) => (
          <div 
            key={item.product_id}
            className="flex items-center gap-4 p-4 border rounded-lg mb-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={item.products?.image || "/placeholder.svg"}
              alt={item.products?.product_name}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{item.products?.product_name}</h3>
              <p className="text-primary font-semibold mt-1">
                ₱{item.products?.product_price.toFixed(2)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const inventoryItem = inventoryData.find(inv => inv.product_id === item.product_id);
                    const maxQuantity = inventoryItem?.quantity || 0;
                    if (item.quantity < maxQuantity) {
                      updateQuantity(item.product_id, item.quantity + 1);
                    } else {
                      toast.error("Cannot exceed available stock");
                    }
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto text-gray-500 hover:text-red-500"
                  onClick={() => removeFromCart(item.product_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">
                ₱{(item.products?.product_price * item.quantity).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {inventoryData.find(inv => inv.product_id === item.product_id)?.quantity || 0} in stock
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </>
  );
}
