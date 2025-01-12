import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InventoryTable } from "./inventory/InventoryTable";
import { UpdateQuantityDialog } from "./inventory/UpdateQuantityDialog";
import { InventoryItem } from "@/types/inventory";

export function InventoryList() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      console.log("Fetching inventory data...");
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          product_id,
          quantity,
          products (
            product_name,
            category,
            image
          )
        `);

      if (error) {
        console.error("Error fetching inventory:", error);
        throw error;
      }
      console.log("Fetched inventory data:", data);
      return data as InventoryItem[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      console.log("Updating quantity for id:", id, "to:", quantity);
      const { data, error } = await supabase
        .from('inventory')
        .update({ quantity })
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating inventory:", error);
        throw error;
      }
      console.log("Update response:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      refetch(); // Explicitly refetch the inventory data
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