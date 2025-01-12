import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { InventoryTable } from "./inventory/InventoryTable";
import { UpdateQuantityDialog } from "./inventory/UpdateQuantityDialog";
import { InventoryItem } from "@/types/inventory";
import { fetchInventory, updateInventoryQuantity } from "@/services/inventoryService";

export function InventoryList() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return await updateInventoryQuantity(id, quantity);
    },
    onSuccess: (updatedItem) => {
      // Update the cache with the new data
      queryClient.setQueryData(['inventory'], (oldData: InventoryItem[] | undefined) => {
        if (!oldData) return [updatedItem];
        return oldData.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        );
      });
      
      setSelectedItem(null);
      setNewQuantity("");
      toast({ title: "Inventory updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "Error updating inventory", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleSave = () => {
    if (!selectedItem) return;
    
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid number",
        variant: "destructive"
      });
      return;
    }

    console.log("Saving new quantity:", quantity, "for item:", selectedItem.id);
    updateMutation.mutate({ id: selectedItem.id, quantity });
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity.toString());
  };

  return (
    <div className="rounded-md border">
      <InventoryTable 
        inventory={inventory}
        onItemClick={handleItemClick}
      />

      <UpdateQuantityDialog
        item={selectedItem}
        newQuantity={newQuantity}
        onQuantityChange={setNewQuantity}
        onClose={() => setSelectedItem(null)}
        onSave={handleSave}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}