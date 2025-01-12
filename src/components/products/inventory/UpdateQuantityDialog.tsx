import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/types/inventory";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Inventory Quantity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {item?.products.image && (
              <img
                src={item.products.image}
                alt={item.products.product_name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-semibold">{item?.products.product_name}</h3>
              <p className="text-sm text-muted-foreground">{item?.products.category}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => onQuantityChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}