
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
                <Input
                  id="theme_color"
                  type="color"
                  value={config.theme_color}
                  onChange={(e) => setConfig({ ...config, theme_color: e.target.value })}
                />
              </div>

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
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_open"
                  checked={config.auto_open}
                  onCheckedChange={(checked) => setConfig({ ...config, auto_open: checked })}
                />
                <Label htmlFor="auto_open">Auto Open</Label>
              </div>

              {config.auto_open && (
                <div className="space-y-2">
                  <Label htmlFor="auto_open_delay">Auto Open Delay (ms)</Label>
                  <Input
                    id="auto_open_delay"
                    type="number"
                    value={config.auto_open_delay}
                    onChange={(e) => setConfig({ ...config, auto_open_delay: parseInt(e.target.value) })}
                    min="1000"
                    max="10000"
                  />
                </div>
              )}
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
