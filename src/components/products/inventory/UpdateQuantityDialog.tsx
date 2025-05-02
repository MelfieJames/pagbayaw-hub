import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/types/inventory";
import { Package, Layers, Hash } from "lucide-react";

interface UpdateQuantityDialogProps {
  item: InventoryItem | null;
  newQuantity: string;
  onQuantityChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
}

export function UpdateQuantityDialog({
  item,
  newQuantity,
  onQuantityChange,
  onClose,
  onSave,
  isLoading,
}: UpdateQuantityDialogProps) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#8B7355] flex items-center gap-2">
            <Hash className="w-5 h-5 text-[#8B7355]" />
            Update Inventory Quantity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {item?.products.image ? (
              <img
                src={item.products.image}
                alt={item.products.product_name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                <Package className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {item?.products.product_name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Layers className="w-4 h-4" />
                {item?.products.category}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-500" />
              <Input
                id="quantity"
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
