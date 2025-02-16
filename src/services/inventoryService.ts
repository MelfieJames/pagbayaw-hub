
import { supabase } from "@/services/supabase/client";
import { InventoryItem } from "@/types/inventory";

type SupabaseInventoryResponse = {
  id: number;
  product_id: number;
  quantity: number;
  products: {
    product_name: string;
    category: string;
    image: string | null;
  };
}

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

  // Transform the data to match InventoryItem type
  const inventory: InventoryItem[] = (data as SupabaseInventoryResponse[]).map(item => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    products: {
      product_name: item.products.product_name,
      category: item.products.category,
      image: item.products.image
    }
  }));

  console.log("Fetched inventory data:", inventory);
  return inventory;
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

  // Transform the response to match InventoryItem type
  const updatedItem: InventoryItem = {
    id: data.id,
    product_id: data.product_id,
    quantity: data.quantity,
    products: {
      product_name: data.products.product_name,
      category: data.products.category,
      image: data.products.image
    }
  };

  console.log("Update response:", updatedItem);
  return updatedItem;
}
