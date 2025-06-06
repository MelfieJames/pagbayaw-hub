
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
    welcome_message: "Hello! How can I help you today?",
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

  const handleInputChange = (field: keyof ChatbotConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Chatbot Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Settings</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => handleInputChange('enabled', checked)}
              />
              <Label htmlFor="enabled">Enable Chatbot</Label>
            </div>

            <div>
              <Label htmlFor="bot_name">Bot Name</Label>
              <Input
                id="bot_name"
                value={config.bot_name}
                onChange={(e) => handleInputChange('bot_name', e.target.value)}
                placeholder="Enter bot name"
              />
            </div>

            <div>
              <Label htmlFor="theme_color">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  id="theme_color"
                  type="color"
                  value={config.theme_color}
                  onChange={(e) => handleInputChange('theme_color', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={config.theme_color}
                  onChange={(e) => handleInputChange('theme_color', e.target.value)}
                  placeholder="#C4A484"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Select
                value={config.position}
                onValueChange={(value: 'bottom-right' | 'bottom-left') => handleInputChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-open Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Auto-open Settings</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_open"
                checked={config.auto_open}
                onCheckedChange={(checked) => handleInputChange('auto_open', checked)}
              />
              <Label htmlFor="auto_open">Auto-open chatbot</Label>
            </div>

            {config.auto_open && (
              <div>
                <Label htmlFor="auto_open_delay">Auto-open delay (seconds)</Label>
                <Input
                  id="auto_open_delay"
                  type="number"
                  min="1"
                  max="60"
                  value={config.auto_open_delay / 1000}
                  onChange={(e) => handleInputChange('auto_open_delay', parseInt(e.target.value) * 1000)}
                  placeholder="3"
                />
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Messages</h3>
          
          <div>
            <Label htmlFor="welcome_message">Welcome Message</Label>
            <Textarea
              id="welcome_message"
              value={config.welcome_message}
              onChange={(e) => handleInputChange('welcome_message', e.target.value)}
              placeholder="Enter welcome message"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="system_prompt">System Prompt</Label>
            <Textarea
              id="system_prompt"
              value={config.system_prompt}
              onChange={(e) => handleInputChange('system_prompt', e.target.value)}
              placeholder="Enter system prompt for the AI assistant"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              This prompt defines how the chatbot should behave and respond to users.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preview</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.theme_color }}
              >
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">{config.bot_name}</span>
              {!config.enabled && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Disabled</span>
              )}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm">{config.welcome_message}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (existingConfig) {
                setConfig(existingConfig);
              }
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
          >
            {saveConfigMutation.isPending ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
