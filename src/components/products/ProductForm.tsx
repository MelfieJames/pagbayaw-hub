import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductFormData, ProductFormProps } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUploadSection } from "./ImageUploadSection";

export function ProductForm({ onSubmit, initialData, isLoading }: ProductFormProps) {
  const [imageType, setImageType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [imageUrl, setImageUrl] = useState(initialData?.image || '');
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      product_name: initialData?.product_name || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      product_price: initialData?.product_price || 0,
      image: null,
    },
  });

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const formData = {
        ...data,
        product_price: Number(data.product_price),
        image: imageType === 'file' ? selectedFile : imageUrl,
      };
      await onSubmit(formData);
      form.reset();
      setSelectedFile(null);
      setImagePreview(null);
      setImageUrl('');
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ImageUploadSection
            imageType={imageType}
            imageUrl={imageUrl}
            imagePreview={imagePreview}
            onImageTypeChange={setImageType}
            onUrlChange={handleImageUrlChange}
            onFileChange={handleFileChange}
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
                    value={field.value}
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