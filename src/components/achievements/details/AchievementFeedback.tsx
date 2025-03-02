
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Feedback {
  id: number;
  achievement_id: number;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
  user_email?: string; // Simplified approach without relying on profiles join
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
  const queryClient = useQueryClient();
  
  const { 
    data: feedbacks, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['achievement-feedback', achievementId],
    queryFn: async () => {
      console.log('Fetching achievement feedback for:', achievementId);
      
      // First get all feedback for this achievement
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('achievement_feedback')
        .select('*')
        .eq('achievement_id', achievementId)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        throw feedbackError;
      }
      
      // Then fetch user emails separately if there are feedbacks with user_ids
      const feedbacksWithUserData = await Promise.all((feedbackData || []).map(async (feedback) => {
        if (feedback.user_id) {
          // For each feedback with a user_id, get the corresponding email from profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', feedback.user_id)
            .single();
            
          if (!profileError && profileData) {
            return { ...feedback, user_email: profileData.email };
          }
        }
        return feedback;
      }));
      
      console.log('Feedback data with user info:', feedbacksWithUserData);
      return feedbacksWithUserData as Feedback[];
    },
    retry: 2,
    refetchOnWindowFocus: false
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!comment.trim()) {
        throw new Error("Please enter a comment");
      }
      
      console.log('Submitting feedback for achievement:', achievementId);
      const { error } = await supabase
        .from('achievement_feedback')
        .insert({
          achievement_id: achievementId,
          user_id: user?.id,
          comment,
          rating: 5 // Default rating
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      
      setComment("");
      // Explicitly invalidate the query to force a refetch
      queryClient.invalidateQueries({ queryKey: ['achievement-feedback', achievementId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading feedback...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-600 font-medium">Error loading feedback</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
        <Button 
          variant="outline" 
          className="mt-3"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['achievement-feedback', achievementId] })}
        >
          Try Again
        </Button>
      </div>
    );
  }

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
            disabled={submitMutation.isPending}
          />
          <Button 
            onClick={() => submitMutation.mutate()} 
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : "Submit Feedback"}
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
                    {feedback.user_email 
                      ? feedback.user_email.substring(0, 2).toUpperCase() 
                      : 'GU'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {feedback.user_email || 'Guest User'}
                    </span>
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
