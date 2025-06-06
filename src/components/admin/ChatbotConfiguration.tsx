
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bot, Save, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ChatbotQAManagement } from "./ChatbotQAManagement";

interface ChatbotConfig {
  id?: number;
  enabled: boolean;
  welcome_message: string;
  system_prompt: string;
  bot_name: string;
  theme_color: string;
  position: 'bottom-right' | 'bottom-left';
  auto_open: boolean;
  auto_open_delay: number;
}

export default function ChatbotConfiguration() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<ChatbotConfig>({
    enabled: true,
    welcome_message: "Hello! I'm your UNVAS assistant. How can I help you today?",
    system_prompt: "You are a helpful customer service assistant for UNVAS. Be friendly, professional, and helpful in answering questions about products, orders, and general inquiries.",
    bot_name: "UNVAS Assistant",
    theme_color: "#C4A484",
    position: 'bottom-right',
    auto_open: false,
    auto_open_delay: 3000,
  });

  const { data: existingConfig, isLoading } = useQuery({
    queryKey: ['chatbot-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching chatbot config:', error);
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, [existingConfig]);

  const saveConfigMutation = useMutation({
    mutationFn: async (configData: ChatbotConfig) => {
      if (existingConfig?.id) {
        const { error } = await supabase
          .from('chatbot_config')
          .update({
            enabled: configData.enabled,
            welcome_message: configData.welcome_message,
            system_prompt: configData.system_prompt,
            bot_name: configData.bot_name,
            theme_color: configData.theme_color,
            position: configData.position,
            auto_open: configData.auto_open,
            auto_open_delay: configData.auto_open_delay,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chatbot_config')
          .insert([{
            enabled: configData.enabled,
            welcome_message: configData.welcome_message,
            system_prompt: configData.system_prompt,
            bot_name: configData.bot_name,
            theme_color: configData.theme_color,
            position: configData.position,
            auto_open: configData.auto_open,
            auto_open_delay: configData.auto_open_delay
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Chatbot configuration saved successfully');
      queryClient.invalidateQueries({ queryKey: ['chatbot-config'] });
    },
    onError: (error) => {
      console.error('Error saving chatbot config:', error);
      toast.error('Failed to save configuration. Please try again.');
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chatbot Q&A Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChatbotQAManagement />
        </CardContent>
      </Card>
    </div>
  );
}
