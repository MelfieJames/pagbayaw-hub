export interface InventoryItem {
  id: number;
  product_id: number;
  quantity: number;
  products: {
    product_name: string;
    category: string;
    image: string | null;
  };
}