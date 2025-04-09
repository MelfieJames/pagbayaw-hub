import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase/client";
import { FileInput } from "@/components/ui/file-input";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  achievement_name: z.string().min(2, {
    message: "Achievement name must be at least 2 characters.",
  }),
  date: z.date(),
  venue: z.string().min(2, {
    message: "Venue must be at least 2 characters.",
  }),
  image: z.any().optional(),
  about_text: z.string().optional(),
});

interface AchievementFormProps {
  mode: "add" | "edit";
  initialData?: any;
  onSuccess: () => void;
  onClose: () => void;
}

export const AchievementForm = ({ mode, initialData, onSuccess, onClose }: AchievementFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      achievement_name: "",
      date: new Date(),
      venue: "",
      image: null,
      about_text: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let imageUrl = initialData?.image || null;

      if (values.image) {
        const fileExt = values.image.name.split('.').pop();
        const filePath = `achievements/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, values.image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Error uploading image');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const achievementData = {
        achievement_name: values.achievement_name,
        date: values.date.toISOString(),
        venue: values.venue,
        image: imageUrl,
        about_text: values.about_text,
      };

      let response;
      if (mode === "edit") {
        response = await supabase
          .from('achievements')
          .update(achievementData)
          .eq('id', initialData.id);
      } else {
        response = await supabase
          .from('achievements')
          .insert(achievementData)
          .select();
      }

      if (response.error) {
        console.error("Error submitting achievement:", response.error);
        toast({
          title: "Error",
          description: `Failed to ${mode === "edit" ? "update" : "create"} achievement.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Achievement ${mode === "edit" ? "updated" : "created"} successfully.`,
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting achievement:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode === "edit" ? "update" : "create"} achievement.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="achievement_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Achievement Name</FormLabel>
              <FormControl>
                <Input placeholder="Achievement Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <DatePicker
                className={cn(
                  "border-input bg-background text-foreground ring-offset-background focus-visible:ring-ring focus-visible:ring-offset-2",
                  "w-full"
                )}
                onSelect={field.onChange}
                defaultMonth={field.value}
                value={field.value}
                dateFormat="MM/dd/yyyy"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="venue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <FormControl>
                <Input placeholder="Venue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="about_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us more about this achievement"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileInput
                  onChange={(file: File | null) => {
                    field.onChange(file);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {mode === "edit" ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
