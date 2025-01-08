import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2, Plus, Star, Award, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductForm } from "@/components/products/ProductForm";
import { Product, ProductFormData } from "@/types/product";
import { createProduct, getProducts, deleteProduct, updateProduct } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";

const ProductManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating product", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) => 
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditing(false);
      setSelectedProduct(null);
      toast({ title: "Product updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating product", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting product", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    if (selectedProduct && isEditing) {
      await updateMutation.mutateAsync({ id: selectedProduct.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#8B7355] text-white">
        <div className="p-4 flex items-center gap-2">
          <img 
            src="/lovable-uploads/5c03a00c-16fb-4305-bb33-b3a748c95b67.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-xl font-bold">ADMIN</h1>
        </div>
        
        <nav className="mt-8">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Star className="w-6 h-6" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/achievements" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Award className="w-6 h-6" />
            <span>Add Achievements</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 bg-[#9b815f] text-white">
            <ShoppingBag className="w-6 h-6" />
            <span>Add Products</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#8B7355] mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
            <ProductForm
              onSubmit={handleSubmit}
              initialData={selectedProduct}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#8B7355] mb-4">Products List</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.image || "/placeholder.svg"} 
                          alt={product.product_name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditing(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteMutation.mutate(product.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;