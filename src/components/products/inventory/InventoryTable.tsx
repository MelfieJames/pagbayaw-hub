import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryItem } from "@/types/inventory";
import {
  Package,
  Layers,
  ClipboardList,
  ShoppingCart,
} from "lucide-react";

interface InventoryTableProps {
  inventory: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
}

export function InventoryTable({ inventory, onItemClick }: InventoryTableProps) {
  return (
    <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200">
      <div className="bg-[#f5f5f5] p-6 border-b border-gray-200 rounded-t-3xl">
        <h2 className="text-2xl font-bold text-[#8B7355] flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          Inventory Table
        </h2>
      </div>

      <Table className="text-sm">
        <TableHeader>
          <TableRow className="bg-[#fdfdfd]">
            <TableHead className="text-[#8B7355] font-semibold text-base flex items-center gap-2">
              <Package className="w-4 h-4 inline mr-1" />
              Image
            </TableHead>
            <TableHead className="text-[#8B7355] font-semibold text-base">
              <ShoppingCart className="w-4 h-4 inline mr-1" />
              Product Name
            </TableHead>
            <TableHead className="text-[#8B7355] font-semibold text-base">
              <Layers className="w-4 h-4 inline mr-1" />
              Category
            </TableHead>
            <TableHead className="text-[#8B7355] font-semibold text-base">
              <ClipboardList className="w-4 h-4 inline mr-1" />
              Quantity
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {inventory.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onItemClick(item)}
              className="cursor-pointer hover:bg-[#f7f7f7] transition-all"
            >
              <TableCell>
                {item.products.image ? (
                  <img
                    src={item.products.image}
                    alt={item.products.product_name}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-14 h-14 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium text-gray-800">
                {item.products.product_name}
              </TableCell>
              <TableCell className="text-gray-600">
                {item.products.category}
              </TableCell>
              <TableCell className="text-gray-800 font-semibold">
                {item.quantity}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
