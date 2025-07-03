
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  const handleViewProducts = () => {
    navigate("/products");
  };

  const handleViewAchievements = () => {
    navigate("/achievements");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{
          backgroundImage: "url('/lovable-uploads/unvaspic0.jpg')",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6 animate-fade-in">
        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight transform hover:scale-105 transition-transform duration-300 cursor-default">
          UNVAS
        </h1>
        
        {/* Subtitle */}
        <p className="text-2xl md:text-3xl mb-4 font-light opacity-90 transform hover:scale-105 transition-all duration-300 cursor-default">
          Celebrating Excellence in Every Achievement
        </p>
        
        {/* Description */}
        <p className="text-lg md:text-xl mb-12 font-light opacity-80 max-w-3xl mx-auto leading-relaxed transform hover:scale-105 transition-all duration-300 cursor-default">
          Discover our journey of accomplishments and explore our premium collection of products that reflect our commitment to quality and excellence.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            onClick={handleViewAchievements}
            size="lg"
            className="bg-[#8B7355] hover:bg-[#6D5A42] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl min-w-[220px] group"
          >
            <span className="group-hover:animate-pulse">Our Achievements</span>
          </Button>
          
          <Button
            onClick={handleViewProducts}
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-amber-600 hover:border-amber-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl min-w-[220px] group bg-transparent backdrop-blur-sm"
          >
            <span className="group-hover:animate-pulse">Our Products</span>
          </Button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <div className="flex flex-col items-center space-y-2">
          <ChevronDown className="w-6 h-6" />
          <p className="text-sm font-light">Scroll to explore</p>
        </div>
      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-amber-400/30 rounded-full animate-pulse animation-delay-2000"></div>
      </div>
    </div>
  );
};

export default Hero;
