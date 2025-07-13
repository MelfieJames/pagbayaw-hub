
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Contact = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to send a message.");
      navigate("/login");
      return;
    }

    if (!email || !subject || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setTimeout(() => {
      setIsModalOpen(true);
      setSubject("");
      setMessage("");
    }, 1000);
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F8FFFB] via-[#E9F8F3] to-[#DFF5EC]">
      <Navbar />
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-6 py-20 gap-12 max-w-6xl mx-auto min-h-[700px]">
=======
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/lovable-uploads/unvaspic5.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/60 to-green-900/80"></div>
      </div>
      
      {/* Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="bubble-gentle absolute rounded-full bg-gradient-to-br from-white/20 to-green-200/10 backdrop-blur-sm border border-white/10"
            style={{
              width: `${Math.random() * 50 + 20}px`,
              height: `${Math.random() * 50 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      <Navbar />
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-6 py-10 gap-12 max-w-6xl mx-auto relative z-10">
>>>>>>> 86f416d4579a79be84e58f480bf7648ced745a19
        {/* Left Side: Contact Image & Details */}
        <div className="flex flex-col items-center lg:items-start w-full lg:w-1/2 text-center lg:text-left">
          <img
            src="https://static.vecteezy.com/system/resources/previews/027/244/724/non_2x/contact-us-or-the-customer-support-hotline-people-connect-businessman-touching-virtual-icons-doing-to-customer-service-call-center-free-png.png"
            alt="Contact Us"
            className="w-full max-w-[280px] lg:max-w-[320px] transform hover:scale-105 transition-all duration-500"
          />

          <div className="mt-6 space-y-4 text-white">
            {/* Phone Number */}
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full bubble-heartbeat">
                <Phone className="text-white" size={20} />
              </div>
              <p className="text-lg font-semibold group-hover:text-green-300 transition-colors duration-300">+63 912 345 6789</p>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full bubble-heartbeat animation-delay-1000">
                <Mail className="text-white" size={20} />
              </div>
              <p className="text-lg font-semibold group-hover:text-green-300 transition-colors duration-300">projectuplift21@gmail.com</p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full bubble-heartbeat animation-delay-2000">
                <MapPin className="text-white" size={20} />
              </div>
              <p className="text-lg font-semibold group-hover:text-green-300 transition-colors duration-300">
                Alta Tierra, Tiguma, Pagadian City, Philippines, 7016
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="w-full lg:w-1/2 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-8 border border-white/20 card-hover">
          <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent">Contact Us</h1>
          <p className="text-center text-gray-600 mb-6">
            Have questions? We're here to help! Fill out the form below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
              <div className="relative group">
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed pl-10 group-hover:bg-gray-200 transition-colors duration-300"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="transition-all duration-300 focus:scale-105"
              />
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your message here..."
                className="resize-none transition-all duration-300 focus:scale-105"
              />
            </div>

            {/* Send Message Button */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 transition-all duration-500 transform hover:scale-105 animate-glow"
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-green-600">
              THANK YOU FOR CONTACTING US!
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default Contact;
