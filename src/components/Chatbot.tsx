
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { supabase } from "@/services/supabase/client";

interface ChatbotConfig {
  enabled: boolean;
  welcome_message: string;
  bot_name: string;
  theme_color: string;
  position: 'bottom-right' | 'bottom-left';
}

interface ChatbotQA {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch chatbot configuration from database
  const { data: config } = useQuery({
    queryKey: ['chatbot-config-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('enabled, welcome_message, bot_name, theme_color, position')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching chatbot config:', error);
        return {
          enabled: true,
          welcome_message: "Hello! I'm your UNVAS assistant. How can I help you today?",
          bot_name: "UNVAS Assistant",
          theme_color: "#C4A484",
          position: 'bottom-right' as const,
        };
      }

      return data || {
        enabled: true,
        welcome_message: "Hello! I'm your UNVAS assistant. How can I help you today?",
        bot_name: "UNVAS Assistant",
        theme_color: "#C4A484",
        position: 'bottom-right' as const,
      };
    },
  });

  // Fetch custom Q&A from database
  const { data: customQA } = useQuery({
    queryKey: ['chatbot-qa-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_qa')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching chatbot Q&A:', error);
        return [];
      }

      return data || [];
    },
  });

  // Initialize messages with welcome message from config
  useEffect(() => {
    if (config && messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: config.welcome_message
        }
      ]);
    }
  }, [config]);

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Don't render if chatbot is disabled
  if (!config || !config.enabled) {
    return null;
  }

  const handleSend = () => {
    if (inputText.trim() === "") return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: inputText }
    ]);

    // Find a match in custom Q&A first, then fallback to default
    const userInput = inputText.toLowerCase();
    const matchedCustomQA = customQA?.find(qa => 
      qa.question.toLowerCase().includes(userInput) || 
      userInput.includes(qa.question.toLowerCase().replace(/[?]/g, ""))
    );

    setTimeout(() => {
      if (matchedCustomQA) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: matchedCustomQA.answer }
        ]);
      } else {
        // Default fallback response
        setMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: "I don't have that specific information at the moment. For detailed inquiries, please contact us at projectuplift21@gmail.com or visit our contact page. Is there anything else I can help you with from our available topics?" 
          }
        ]);
      }
      setShowSuggestions(true);
    }, 500);

    setInputText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSuggestionClick = (question) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: question }
    ]);

    const qa = customQA?.find(qa => qa.question === question);
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: qa ? qa.answer : "I don't have information about that topic." }
      ]);
      setShowSuggestions(true);
    }, 500);
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <div className={`fixed ${positionClasses[config.position]} z-50`}>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-3 rounded-full shadow-lg hover:scale-105 transition-all duration-200"
        style={{ backgroundColor: config.theme_color }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`absolute bottom-16 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[500px] ${
          config.position === 'bottom-left' ? 'left-0' : 'right-0'
        }`}>
          {/* Header */}
          <div 
            className="text-white px-4 py-3 rounded-t-lg flex justify-between items-center"
            style={{ backgroundColor: config.theme_color }}
          >
            <h3 className="font-medium">{config.bot_name}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 max-h-80">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "text-white rounded-tr-none"
                      : "bg-white border border-gray-200 rounded-tl-none"
                  }`}
                  style={message.sender === "user" ? { backgroundColor: config.theme_color } : {}}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {/* Suggestions */}
            {showSuggestions && messages.length >= 1 && messages[messages.length - 1].sender === "bot" && customQA && customQA.length > 0 && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Ask me about:</h4>
                  <button 
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {customQA.slice(0, 5).map((qa, index) => (
                    <button
                      key={index}
                      className="w-full text-left text-sm p-2 hover:bg-gray-100 rounded-md transition-colors duration-150"
                      onClick={() => handleSuggestionClick(qa.question)}
                    >
                      {qa.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': config.theme_color } as any}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="text-white px-3 py-2 rounded-r-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: config.theme_color }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
