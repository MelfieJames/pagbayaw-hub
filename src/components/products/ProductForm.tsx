import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductFormData, ProductFormProps } from "@/types/product";
import { ImageUpload } from "./ImageUpload";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProductForm({ onSubmit, initialData, isLoading }: ProductFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      product_name: initialData?.product_name || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      product_price: initialData?.product_price || 0,
      image: null,
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const formData = {
        ...data,
        image: selectedImage,
      };
      await onSubmit(formData);
      form.reset();
      setSelectedImage(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ImageUpload
            onImageSelected={setSelectedImage}
            currentImage={initialData?.image}
          />

          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter product name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter category" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₱)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="Enter price in PHP" 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Product"}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
}