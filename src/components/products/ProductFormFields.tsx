import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProductFormData } from "@/types/product";

interface ProductFormFieldsProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductFormFields = ({ form }: ProductFormFieldsProps) => {
  return (
    <>
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
    </>
  );
};