
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/lovable-uploads/unvaspic0.jpg')",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          UNVAS
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl mb-4 font-light opacity-90">
          Celebrating Excellence in Every Achievement
        </p>
        
        {/* Description */}
        <p className="text-lg md:text-xl mb-12 font-light opacity-80 max-w-3xl mx-auto leading-relaxed">
          Discover our journey of accomplishments and explore our premium collection of products that reflect our commitment to quality and excellence.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            onClick={handleViewAchievements}
            size="lg"
            className="bg-[#8B7355] hover:bg-[#6D5A42] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 min-w-[200px]"
          >
            Our Achievements
          </Button>
          
          <Button
            onClick={handleViewProducts}
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-[#8B7355] px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 min-w-[200px]"
          >
            Our Products
          </Button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/60">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-[1px] h-16 bg-white/40"></div>
          <p className="text-sm font-light">Scroll to explore</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
