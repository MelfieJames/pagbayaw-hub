import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductList } from "@/components/products/ProductList";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { Product } from "@/types/product";
import { createProduct, getProducts, deleteProduct, updateProduct } from "@/services/productService";
import { useAuth } from "@/contexts/AuthContext";

const ProductManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check authentication
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/login");
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin to access this page.",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    enabled: !!user?.isAdmin, // Only fetch if user is admin
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error creating product", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditing(false);
      setSelectedProduct(null);
      toast({ title: "Product updated successfully" });
    },
    onError: (error: Error) => {
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
    onError: (error: Error) => {
      toast({ 
        title: "Error deleting product", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleSubmit = async (data: any) => {
    if (selectedProduct && isEditing) {
      await updateMutation.mutateAsync({ id: selectedProduct.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
  };

  if (!user?.isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
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

          <ProductList 
            products={products}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;