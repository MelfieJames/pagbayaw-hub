
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Feedback {
  id: number;
  achievement_id: number;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
  profiles: {
    email: string;
  };
}

interface AchievementFeedbackProps {
  achievementId: number;
  isAuthenticated: boolean;
}

export const AchievementFeedback = ({ 
  achievementId,
  isAuthenticated 
}: AchievementFeedbackProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const { data: feedbacks, refetch } = useQuery({
    queryKey: ['achievement-feedback', achievementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_feedback')
        .select(`
          *,
          profiles:user_id (
            email
          )
        `)
        .eq('achievement_id', achievementId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    }
  });

  const submitFeedback = async () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('achievement_feedback')
        .insert({
          achievement_id: achievementId,
          user_id: user?.id,
          comment,
          rating: 5 // Default rating
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      
      setComment("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated && (!feedbacks || feedbacks.length === 0)) {
    return <p className="text-gray-500">There are no reviews for this event yet.</p>;
  }

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Leave Your Feedback</h3>
          <Textarea
            placeholder="Share your thoughts about this event..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3"
            rows={4}
          />
          <Button onClick={submitFeedback}>
            Submit Feedback
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {feedbacks && feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="border-b pb-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {feedback.profiles.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{feedback.profiles.email}</span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(feedback.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="mt-1">{feedback.comment}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">There are no reviews for this event yet.</p>
        )}
      </div>
    </div>
  );
};
