import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryItem } from "@/types/inventory";

interface InventoryTableProps {
  inventory: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
}

export function InventoryTable({ inventory, onItemClick }: InventoryTableProps) {
  return (
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
            onClick={() => onItemClick(item)}
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
  );
}