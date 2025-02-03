import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow 
              key={product.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(product)}
            >
              <TableCell>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.product_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">{product.product_name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>₱{product.product_price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4">
              {selectedProduct.image && (
                <div className="flex justify-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.product_name}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm">Product Name</h3>
                  <p className="text-muted-foreground">{selectedProduct.product_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Category</h3>
                  <p className="text-muted-foreground">{selectedProduct.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Price</h3>
                  <p className="text-muted-foreground">₱{selectedProduct.product_price.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Added On</h3>
                  <p className="text-muted-foreground">
                    {selectedProduct.created_at 
                      ? format(new Date(selectedProduct.created_at), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm">Description</h3>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}