import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Added Footer
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react"; // Icons
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Modal

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-6 py-10 gap-12 max-w-6xl mx-auto">
        {/* Left Side: Contact Image & Details */}
        <div className="flex flex-col items-center lg:items-start w-full lg:w-1/2 text-center lg:text-left">
          <img
            src="https://static.vecteezy.com/system/resources/previews/027/244/724/non_2x/contact-us-or-the-customer-support-hotline-people-connect-businessman-touching-virtual-icons-doing-to-customer-service-call-center-free-png.png"
            alt="Contact Us"
            className="w-full max-w-[280px] lg:max-w-[320px]" // Slightly smaller image
          />

          <div className="mt-6 space-y-4">
            {/* Phone Number */}
            <div className="flex items-center gap-3">
              <Phone className="text-[#6b8e68]" size={20} />
              <p className="text-lg font-semibold text-gray-700">+63 912 345 6789</p>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="text-[#6b8e68]" size={20} />
              <p className="text-lg font-semibold text-gray-700">projectuplift21@gmail.com</p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin className="text-[#6b8e68]" size={20} />
              <p className="text-lg font-semibold text-gray-700">
                Alta Tierra, Tiguma, Pagadian City, Philippines, 7016
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="w-full lg:w-1/2 bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Contact Us</h1>
          <p className="text-center text-gray-600 mb-6">
            Have questions? We're here to help! Fill out the form below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Email</label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your message here..."
                className="resize-none"
              />
            </div>

            {/* Send Message Button */}
            <Button type="submit" className="w-full bg-[#6b8e68] hover:bg-[#5a7c5a]">
              Send Message
            </Button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#6b8e68]">
              THANK YOU FOR CONTACTING US!
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Contact;
