import { supabase } from "@/services/supabase/client";
import { InventoryItem } from "@/types/inventory";

export async function fetchInventory(): Promise<InventoryItem[]> {
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
  return data;
}

export async function updateInventoryQuantity(id: number, quantity: number): Promise<InventoryItem> {
  console.log("Updating quantity for id:", id, "to:", quantity);
  const { data, error } = await supabase
    .from('inventory')
    .update({ 
      quantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id,
      product_id,
      quantity,
      products (
        product_name,
        category,
        image
      )
    `)
    .single();

  if (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
  console.log("Update response:", data);
  return data;
}
