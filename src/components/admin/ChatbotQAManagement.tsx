import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ChatbotQA {
  id?: number;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
}

export function ChatbotQAManagement() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQA, setNewQA] = useState<ChatbotQA>({
    question: "",
    answer: "",
    is_active: true,
    display_order: 0
  });
  const [editData, setEditData] = useState<ChatbotQA>({
    question: "",
    answer: "",
    is_active: true,
    display_order: 0
  });

  const { data: qaList, isLoading } = useQuery({
    queryKey: ['chatbot-qa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_qa')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const addQAMutation = useMutation({
    mutationFn: async (qa: ChatbotQA) => {
      const { error } = await supabase
        .from('chatbot_qa')
        .insert([qa]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Q&A added successfully');
      setNewQA({ question: "", answer: "", is_active: true, display_order: 0 });
      queryClient.invalidateQueries({ queryKey: ['chatbot-qa'] });
    },
    onError: () => {
      toast.error('Failed to add Q&A');
    }
  });

  const updateQAMutation = useMutation({
    mutationFn: async ({ id, ...qa }: ChatbotQA & { id: number }) => {
      const { error } = await supabase
        .from('chatbot_qa')
        .update(qa)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Q&A updated successfully');
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['chatbot-qa'] });
    },
    onError: () => {
      toast.error('Failed to update Q&A');
    }
  });

  const deleteQAMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('chatbot_qa')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Q&A deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['chatbot-qa'] });
    },
    onError: () => {
      toast.error('Failed to delete Q&A');
    }
  });

  const handleAdd = () => {
    if (!newQA.question.trim() || !newQA.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }
    addQAMutation.mutate(newQA);
  };

  const handleEdit = (qa: any) => {
    setEditingId(qa.id);
    setEditData(qa);
  };

  const handleSaveEdit = () => {
    if (!editData.question.trim() || !editData.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }
    updateQAMutation.mutate({ id: editingId!, ...editData });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ question: "", answer: "", is_active: true, display_order: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chatbot Q&A Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Q&A */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Add New Q&A</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-question">Question</Label>
              <Input
                id="new-question"
                value={newQA.question}
                onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                placeholder="Enter question"
              />
            </div>
            <div>
              <Label htmlFor="new-answer">Answer</Label>
              <Textarea
                id="new-answer"
                value={newQA.answer}
                onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
                placeholder="Enter answer"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newQA.is_active}
                onCheckedChange={(checked) => setNewQA({ ...newQA, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
            <Button
              onClick={handleAdd}
              disabled={addQAMutation.isPending}
              className="w-full"
            >
              {addQAMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Q&A
            </Button>
          </div>
        </div>

        {/* Existing Q&A List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Existing Q&A</h3>
          {qaList?.map((qa) => (
            <div key={qa.id} className="border rounded-lg p-4">
              {editingId === qa.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>Question</Label>
                    <Input
                      value={editData.question}
                      onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Answer</Label>
                    <Textarea
                      value={editData.answer}
                      onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editData.is_active}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={updateQAMutation.isPending}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{qa.question}</h4>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(qa)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteQAMutation.mutate(qa.id)}
                        size="sm"
                        variant="outline"
                        disabled={deleteQAMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{qa.answer}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${qa.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {qa.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">Order: {qa.display_order}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
