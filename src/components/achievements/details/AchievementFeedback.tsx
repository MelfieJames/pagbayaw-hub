import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Loader2, MessageCircle } from "lucide-react";

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
      <div className="flex justify-center items-center py-8 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading feedback...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center w-full">
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
    return <p className="text-gray-500 w-full">There are no reviews for this achievement yet.</p>;
  }

  const getDisplayName = (email: string): string => {
    // Get username part before @
    const username = email.split('@')[0];
    
    // Split by common separators and capitalize each part
    const nameParts = username.split(/[._-]/);
    const formattedName = nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
      
    return `${formattedName} · ${email}`;
  };

  return (
    <div className="space-y-6 w-full">
      {isAuthenticated && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm w-full">
          <h3 className="font-semibold mb-3 text-lg flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-purple-600" />
            Share Your Thoughts
          </h3>
          <Textarea
            placeholder="Share your thoughts about this achievement..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4"
            rows={4}
            disabled={submitMutation.isPending}
          />
          <Button 
            onClick={() => submitMutation.mutate()} 
            disabled={submitMutation.isPending}
            className="px-6"
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

      <div className="space-y-6 w-full">
        <h3 className="font-semibold text-lg text-purple-700">What Others Are Saying</h3>
        
        {feedbacks && feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-purple-100">
                  <AvatarFallback className="bg-purple-50 text-purple-700">
                    {feedback.user_email 
                      ? feedback.user_email.substring(0, 2).toUpperCase() 
                      : 'FB'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {feedback.user_email 
                        ? getDisplayName(feedback.user_email)
                        : 'Feedback User · feedback@example.com'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(feedback.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="mt-3 text-gray-700">{feedback.comment}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 py-4">There are no reviews for this achievement yet.</p>
        )}
      </div>
    </div>
  );
};
