
export interface Notification {
  id: number;
  message: string;
  created_at: string;
  type: string;
  is_read: boolean;
  purchase_id: number | null;
  tracking_number: string | null;
  expected_delivery_date: string | null;
  product_id?: number;
}

export interface PurchaseDetails {
  id: number;
  total_amount: number;
  created_at: string;
  purchase_items: {
    quantity: number;
    products: {
      product_name: string;
    };
  }[];
}
