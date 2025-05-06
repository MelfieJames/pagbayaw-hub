
export interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  about_text: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  image: string | null;
  venue: string;
  points?: number;
  image_url?: string;
  is_active?: boolean;
}
