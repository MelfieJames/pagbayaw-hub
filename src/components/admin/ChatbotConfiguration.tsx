
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      setConfig({
        id: existingConfig.id,
        enabled: existingConfig.enabled,
        welcome_message: existingConfig.welcome_message,
        system_prompt: existingConfig.system_prompt,
        bot_name: existingConfig.bot_name,
        theme_color: existingConfig.theme_color,
        position: existingConfig.position,
      });
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
            position: configData.position
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Chatbot configuration saved successfully');
      queryClient.invalidateQueries({ queryKey: ['chatbot-config'] });
      queryClient.invalidateQueries({ queryKey: ['chatbot-config-public'] });
    },
    onError: (error) => {
      console.error('Error saving chatbot config:', error);
      toast.error('Failed to save configuration. Please try again.');
    }
  });

  const handleSave = () => {
    if (!config.welcome_message.trim()) {
      toast.error('Welcome message is required');
      return;
    }
    if (!config.bot_name.trim()) {
      toast.error('Bot name is required');
      return;
    }
    if (!config.system_prompt.trim()) {
      toast.error('System prompt is required');
      return;
    }
    
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
            Chatbot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
                <Label htmlFor="enabled">Enable Chatbot</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bot_name">Bot Name</Label>
                <Input
                  id="bot_name"
                  value={config.bot_name}
                  onChange={(e) => setConfig({ ...config, bot_name: e.target.value })}
                  placeholder="Enter bot name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme_color">Theme Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="theme_color"
                    type="color"
                    value={config.theme_color}
                    onChange={(e) => setConfig({ ...config, theme_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={config.theme_color}
                    onChange={(e) => setConfig({ ...config, theme_color: e.target.value })}
                    placeholder="#C4A484"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={config.position}
                  onValueChange={(value) => setConfig({ ...config, position: value as 'bottom-right' | 'bottom-left' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Box */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
                  style={{ backgroundColor: `${config.theme_color}20` }}
                >
                  <div 
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm"
                    style={{ backgroundColor: config.theme_color }}
                  >
                    <Bot className="h-4 w-4" />
                    {config.bot_name}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome_message">Welcome Message</Label>
            <Textarea
              id="welcome_message"
              value={config.welcome_message}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              placeholder="Enter welcome message"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system_prompt">System Prompt</Label>
            <Textarea
              id="system_prompt"
              value={config.system_prompt}
              onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
              placeholder="Enter system prompt for the AI"
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={saveConfigMutation.isPending}
              className="bg-[#8B7355] hover:bg-[#6d5a42]"
            >
              {saveConfigMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
