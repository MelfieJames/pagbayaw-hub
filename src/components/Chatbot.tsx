
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// FAQ data for the chatbot
const faqData = [
  {
    question: "What is UNVAS?",
    answer: "UNVAS is an eco-friendly art canvas and craft material made from upcycled dried banana leaves (locally known as 'unas'). It's a sustainable alternative to traditional canvas materials, created to provide livelihood to communities in the Philippines."
  },
  {
    question: "How is UNVAS made?",
    answer: "UNVAS is made by collecting dried banana leaves, processing them through several natural methods, and converting them into durable sheets that can be used for various purposes including art canvas and craft materials."
  },
  {
    question: "Is UNVAS eco-friendly?",
    answer: "Yes, UNVAS is 100% eco-friendly. It utilizes agricultural waste (dried banana leaves) that would otherwise be burned, reducing pollution and carbon emissions. The production process uses minimal chemicals and emphasizes sustainability."
  },
  {
    question: "What makes UNVAS different from other canvas materials?",
    answer: "UNVAS stands out because of its unique texture, sustainability, and social impact. Each UNVAS product directly contributes to community livelihood programs across the Philippines, particularly helping marginalized groups."
  },
  {
    question: "Can I use UNVAS for painting or crafting?",
    answer: "Absolutely! UNVAS works wonderfully for various art forms including acrylic painting, oil painting, and many types of crafts. Its unique texture adds character to artwork and creates distinctive results."
  },
  {
    question: "What kind of UNVAS products do you sell?",
    answer: "We offer a range of products including art canvas in various sizes, printing papers, handmade accessories like earrings and necklaces, home decorations, and raw materials for crafters who want to create their own designs."
  },
  {
    question: "Are all the products handmade?",
    answer: "Yes, all our products are handmade by different community groups across the Philippines, ensuring each item is unique and created with care. This also helps maximize the positive social impact of each purchase."
  },
  {
    question: "Can I request a custom design?",
    answer: "Yes, we accept custom orders for both individual pieces and bulk orders. Please contact us with your specific requirements, and we'll work with our artisan communities to create something special for you."
  },
  {
    question: "Do you offer gift sets or bundles?",
    answer: "Yes, we offer various gift sets and bundles, perfect for presents or as starter kits for those who want to try different UNVAS products. These bundles often come at a special price compared to buying individual items."
  }
];

// Initial messages that the chatbot will display
const initialMessages = [
  {
    id: 1,
    content: "Hello! Welcome to UNVAS. How can I help you today?",
    sender: "bot"
  },
  {
    id: 2,
    content: "You can ask me about our products, the UNVAS material, or how to place an order!",
    sender: "bot"
  }
];

// This function will find the closest FAQ match based on user input
const findFAQMatch = (userInput: string) => {
  const userInputLower = userInput.toLowerCase();
  
  // Check for direct matches first
  for (const faq of faqData) {
    if (userInputLower.includes(faq.question.toLowerCase())) {
      return faq.answer;
    }
  }
  
  // If no direct match, look for keyword matches
  const keywords = {
    "what is": faqData[0].answer,
    "unvas": faqData[0].answer,
    "made": faqData[1].answer,
    "how is": faqData[1].answer,
    "create": faqData[1].answer,
    "eco": faqData[2].answer,
    "environment": faqData[2].answer,
    "sustainable": faqData[2].answer,
    "friendly": faqData[2].answer,
    "different": faqData[3].answer,
    "unique": faqData[3].answer,
    "special": faqData[3].answer,
    "paint": faqData[4].answer,
    "craft": faqData[4].answer,
    "use": faqData[4].answer,
    "product": faqData[5].answer,
    "sell": faqData[5].answer,
    "offer": faqData[5].answer,
    "handmade": faqData[6].answer,
    "custom": faqData[7].answer,
    "request": faqData[7].answer,
    "specific": faqData[7].answer,
    "gift": faqData[8].answer,
    "bundle": faqData[8].answer,
    "set": faqData[8].answer
  };
  
  for (const [keyword, answer] of Object.entries(keywords)) {
    if (userInputLower.includes(keyword)) {
      return answer;
    }
  }
  
  // Default response if no match is found
  return "I'm not sure about that. Would you like to know about our products, what UNVAS is, or how it's made? You can also check our FAQ section on the About Us page.";
};

// Chatbot component
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessageId = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, content: input, sender: "user" }
    ]);
    
    // Clear input and show typing indicator
    setInput("");
    setIsTyping(true);
    
    // Simulate bot thinking and respond after a delay
    setTimeout(() => {
      const botResponse = findFAQMatch(input);
      
      setMessages((prev) => [
        ...prev,
        { id: userMessageId + 1, content: botResponse, sender: "bot" }
      ]);
      
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Closed state - just the icon button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#6b8e68] hover:bg-[#5a7b58] shadow-lg"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      )}
      
      {/* Open state - the chat window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-[450px] overflow-hidden">
          {/* Chat header */}
          <div className="bg-[#6b8e68] text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">UNVAS Support</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-[#5a7b58] h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Chat messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${
                  message.sender === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-[#A8D0B9] text-[#3c4d35]"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat input area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[50px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                className="h-10 w-10 rounded-full bg-[#6b8e68] hover:bg-[#5a7b58] p-0 flex items-center justify-center"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
