import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductFormData, ProductFormProps } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUploadSection } from "./ImageUploadSection";
import { ProductFormFields } from "./ProductFormFields";

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
          <ProductFormFields form={form} />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Product"}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
}