
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";

// Define FAQ data that will be used by the chatbot
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

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your UNVAS assistant. How can I help you today?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: inputText }
    ]);

    // Find an FAQ match or respond with a default message
    const userInput = inputText.toLowerCase();
    const matchedFaq = faqData.find(faq => 
      faq.question.toLowerCase().includes(userInput) || 
      userInput.includes(faq.question.toLowerCase().replace(/[?]/g, ""))
    );

    setTimeout(() => {
      if (matchedFaq) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: matchedFaq.answer }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: "I don't have that information at the moment. For specific inquiries, please contact us at projectuplift21@gmail.com or visit our contact page." 
          }
        ]);
      }
    }, 500);

    setInputText("");
    setShowSuggestions(false);
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

    // Find the answer for this question
    const faq = faqData.find(faq => faq.question === question);
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: faq.answer }
      ]);
    }, 500);

    setShowSuggestions(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#6b8e68] text-white p-3 rounded-full shadow-lg hover:bg-[#5b7a58] transition-colors"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-[#6b8e68] text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">UNVAS® Chat Support</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
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
                      ? "bg-[#6b8e68] text-white rounded-tr-none"
                      : "bg-white border border-gray-200 rounded-tl-none"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {/* Suggestions */}
            {showSuggestions && messages.length <= 2 && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Frequently Asked Questions</h4>
                  <button 
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {faqData.slice(0, 5).map((faq, index) => (
                    <button
                      key={index}
                      className="w-full text-left text-sm p-2 hover:bg-gray-100 rounded-md transition-colors duration-150"
                      onClick={() => handleSuggestionClick(faq.question)}
                    >
                      {faq.question}
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
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#6b8e68]"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="bg-[#6b8e68] text-white px-3 py-2 rounded-r-md hover:bg-[#5b7a58] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
