
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
import { AchievementImageUploader } from "./AchievementImageUploader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  const [achievementId, setAchievementId] = useState<number | null>(initialData?.id || null);
  const [existingImages, setExistingImages] = useState<{ id: number; image_url: string }[]>([]);

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
      if (initialData.id) {
        setAchievementId(initialData.id);
        fetchExistingImages(initialData.id);
      }
    }
  }, [initialData, form]);

  const fetchExistingImages = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('achievement_images')
        .select('*')
        .eq('achievement_id', id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setExistingImages(data || []);
    } catch (error) {
      console.error('Error fetching achievement images:', error);
    }
  };

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
        
        // If this is a new achievement, set the ID for additional images
        if (mode === "add" && response.data && response.data[0]) {
          setAchievementId(response.data[0].id);
        }
        
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

  const handleImagesAdded = () => {
    fetchExistingImages(achievementId as number);
  };

  return (
    <ScrollArea className="max-h-[70vh] px-1">
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
                <FormLabel>Title Image</FormLabel>
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
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Additional Images</h3>
            <p className="text-sm text-muted-foreground">
              You can add multiple additional images after saving the achievement.
            </p>
            
            {achievementId ? (
              <AchievementImageUploader
                achievementId={achievementId}
                onImagesAdded={handleImagesAdded}
                existingImages={existingImages}
              />
            ) : (
              mode === "add" && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800 text-sm">
                  You can add additional images after creating the achievement.
                </div>
              )
            )}
          </div>
          
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
};
