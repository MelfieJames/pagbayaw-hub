import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { useAuth, CustomUser } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Achievement } from "@/types/achievement";

interface AchievementFormState {
  title: string;
  description: string;
  points: number;
  image_url: string;
  is_active: boolean;
}

export const useAchievementForm = (achievementId?: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formState, setFormState] = useState<AchievementFormState>({
    title: "",
    description: "",
    points: 0,
    image_url: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (achievementId) {
      fetchAchievement(achievementId);
    }
  }, [achievementId]);

  const fetchAchievement = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch achievement: ${error.message}`);
      }

      setFormState({
        title: data.title,
        description: data.description,
        points: data.points,
        image_url: data.image_url,
        is_active: data.is_active,
      });
      setImagePreview(data.image_url);
    } catch (err: any) {
      setError(err.message || "Failed to fetch achievement");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch achievement",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("You must be logged in to create an achievement.");
      }

      const uploadPath = `achievements/${user.id}/${Date.now()}-${
        imageFile?.name || "default.png"
      }`;
      let publicURL = formState.image_url;

      if (imageFile) {
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(uploadPath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${uploadPath}`;
      }

      const achievementData = {
        ...formState,
        image_url: publicURL,
      };

      if (achievementId) {
        const { error: updateError } = await supabase
          .from("achievements")
          .update(achievementData)
          .eq("id", achievementId);

        if (updateError) {
          throw new Error(`Failed to update achievement: ${updateError.message}`);
        }
        toast({
          title: "Success",
          description: "Achievement updated successfully",
        });
      } else {
        const { error: insertError } = await supabase
          .from("achievements")
          .insert([
            {
              ...achievementData,
              created_by: user.id,
            },
          ]);

        if (insertError) {
          throw new Error(`Failed to create achievement: ${insertError.message}`);
        }

        toast({
          title: "Success",
          description: "Achievement created successfully",
        });
      }

      navigate("/admin/achievements");
    } catch (err: any) {
      setError(err.message || "Failed to save achievement");
      toast({
        title: "Error",
        description: err.message || "Failed to save achievement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    imagePreview,
    isSubmitting,
    error,
    handleInputChange,
    handleImageChange,
    handleSubmit,
  };
};
