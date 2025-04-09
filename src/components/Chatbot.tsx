
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const botResponses: Record<string, string[]> = {
  default: [
    "Welcome to our website! How can I help you today?",
    "I'm here to assist you with information about our products and services.",
    "Feel free to ask me anything about our offerings!"
  ],
  products: [
    "We offer a variety of products. You can check our products page for more details.",
    "Our product range includes various items. Check out our collection on the products page.",
    "We have numerous products available. Visit our products section to explore."
  ],
  pricing: [
    "Our prices are competitive and vary based on the product. You can see detailed pricing on each product page.",
    "We offer various products at different price points. Check individual product pages for specific pricing.",
    "Price information is available on each product's details page."
  ],
  contact: [
    "You can reach us through our contact page, or email us at support@example.com.",
    "We're available on our contact page. Feel free to reach out!",
    "Visit our contact page for ways to get in touch with our team."
  ],
  shipping: [
    "We ship nationwide. Delivery times typically range from 3-5 business days.",
    "Our shipping is available across the country, usually taking 3-5 days for delivery.",
    "We provide shipping services nationwide with delivery estimates of 3-5 business days."
  ],
  returns: [
    "We have a 30-day return policy for unused items in original packaging.",
    "Items can be returned within 30 days if unused and in original packaging.",
    "Our return policy allows returns within 30 days for unused products in original packaging."
  ],
  login: [
    "You can log in through our login page. If you don't have an account, you can create one there.",
    "The login option is available in the top navigation bar.",
    "Access your account through the login link in our navigation menu."
  ],
  achievements: [
    "Check out our achievements page to see our milestones and accomplishments.",
    "We're proud of our achievements! Visit our achievements page to learn more.",
    "Our achievements page showcases our history and milestones as a company."
  ]
};

const getResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords in the message
  if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('offer')) {
    return getRandomResponse('products');
  } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return getRandomResponse('pricing');
  } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email')) {
    return getRandomResponse('contact');
  } else if (lowerMessage.includes('ship') || lowerMessage.includes('deliver') || lowerMessage.includes('arrival')) {
    return getRandomResponse('shipping');
  } else if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('money back')) {
    return getRandomResponse('returns');
  } else if (lowerMessage.includes('login') || lowerMessage.includes('account') || lowerMessage.includes('sign in')) {
    return getRandomResponse('login');
  } else if (lowerMessage.includes('achievement') || lowerMessage.includes('milestone') || lowerMessage.includes('accomplishment')) {
    return getRandomResponse('achievements');
  }
  
  // Default response
  return getRandomResponse('default');
};

const getRandomResponse = (category: string): string => {
  const responses = botResponses[category] || botResponses.default;
  return responses[Math.floor(Math.random() * responses.length)];
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hi there! How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() === '') return;

    const userMessage: Message = {
      content: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        content: getResponse(userMessage.content),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg z-50 hover:bg-primary/90 transition-all duration-300"
        aria-label="Chat with us"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <Card className={`fixed bottom-20 right-6 bg-white shadow-xl rounded-lg z-50 transition-all duration-300 ${isMinimized ? 'h-12 w-72' : 'w-80 sm:w-96 h-[500px]'}`}>
          {/* Chat header */}
          <div className="bg-primary text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">Chat Support</h3>
            <div className="flex gap-2">
              <button onClick={toggleMinimize} className="hover:bg-primary-dark rounded-full p-1">
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button onClick={toggleChat} className="hover:bg-primary-dark rounded-full p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          {!isMinimized && (
            <>
              <ScrollArea className="p-4 h-[400px]">
                <div className="flex flex-col gap-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`max-w-[80%] ${message.sender === 'user' ? 'ml-auto bg-primary/10 text-gray-800' : 'mr-auto bg-gray-100 text-gray-800'} rounded-lg p-3`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat input */}
              <div className="p-3 border-t flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default Chatbot;
