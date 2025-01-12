import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: number;
  product_id: number;
  quantity: number;
  products: {
    product_name: string;
    category: string;
    image: string | null;
  };
}

export function InventoryList() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
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

      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      refetch(); // Explicitly refetch the inventory data
      setSelectedItem(null);
      toast({ title: "Inventory updated successfully" });
    },
    onError: (error: Error) => {
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

    updateMutation.mutate({ id: selectedItem.id, quantity });
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity.toString());
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((item) => (
            <TableRow 
              key={item.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleItemClick(item)}
            >
              <TableCell>
                {item.products.image && (
                  <img
                    src={item.products.image}
                    alt={item.products.product_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">{item.products.product_name}</TableCell>
              <TableCell>{item.products.category}</TableCell>
              <TableCell>{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedItem?.products.image && (
                <img
                  src={selectedItem.products.image}
                  alt={selectedItem.products.product_name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-semibold">{selectedItem?.products.product_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedItem?.products.category}</p>
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
                onChange={(e) => setNewQuantity(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}