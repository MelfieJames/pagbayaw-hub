
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Sparkles, Star, Award, Package } from "lucide-react";
import { useEffect, useState } from "react";

const FloatingBubbles = () => {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const createBubble = () => ({
      id: Math.random(),
      size: Math.random() * 40 + 15,
      left: Math.random() * 100,
      animationDuration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    });

    const initialBubbles = Array.from({ length: 25 }, createBubble);
    setBubbles(initialBubbles);

    const interval = setInterval(() => {
      setBubbles(prev => {
        const newBubbles = [...prev];
        if (newBubbles.length < 30) {
          newBubbles.push(createBubble());
        }
        return newBubbles.slice(-30);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble bubble-heartbeat"
          style={{
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.animationDuration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const InteractiveParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full bubble-heartbeat"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-400/50 rounded-full bubble-heartbeat animation-delay-1000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/50 rounded-full bubble-heartbeat animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-green-300/40 rounded-full bubble-heartbeat animation-delay-3000"></div>
      <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-white/60 rounded-full bubble-heartbeat animation-delay-4000"></div>
      <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-green-500/50 rounded-full bubble-heartbeat animation-delay-5000"></div>
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleViewProducts = () => {
    navigate("/products");
  };

  const handleViewAchievements = () => {
    navigate("/achievements");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
      {/* Floating Bubbles */}
      <FloatingBubbles />
      
      {/* Interactive Particles */}
      <InteractiveParticles />
      
      {/* Content */}
      <div className="relative z-10 text-center text-green-800 max-w-5xl mx-auto px-6">
        {/* Decorative Elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-green-200/20 to-green-400/30 rounded-full blur-3xl bubble-heartbeat"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-tl from-green-400/30 to-green-200/20 rounded-full blur-3xl bubble-heartbeat animation-delay-2000"></div>
        
        {/* Main Heading */}
        <div className="relative group cursor-default">
          <h1 className="text-7xl md:text-9xl font-bold mb-8 leading-tight transform group-hover:scale-105 transition-all duration-500 bg-gradient-to-r from-green-700 via-green-600 to-green-800 bg-clip-text text-transparent animate-fade-in-up">
            UNVAS
          </h1>
        </div>
        
        {/* Subtitle with Icons */}
        <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in-up animation-delay-1000">
          <Star className="w-6 h-6 text-yellow-500 bubble-heartbeat" />
          <p className="text-2xl md:text-4xl font-light text-green-700 transform hover:scale-105 transition-all duration-300">
            Celebrating Excellence in Every Achievement
          </p>
          <Sparkles className="w-6 h-6 text-yellow-500 bubble-heartbeat animation-delay-1000" />
        </div>
        
        {/* Description */}
        <p className="text-lg md:text-xl mb-12 font-light text-green-600 max-w-4xl mx-auto leading-relaxed transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-2000 glass-green p-6 rounded-2xl">
          Discover our journey of accomplishments and explore our premium collection of products that reflect our commitment to quality and excellence.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in animation-delay-3000">
          <Button
            onClick={handleViewAchievements}
            size="lg"
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white px-10 py-6 text-xl font-semibold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-green-500/25 min-w-[260px] animate-glow"
          >
            <Award className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="group-hover:animate-pulse">Our Achievements</span>
          </Button>
          
          <Button
            onClick={handleViewProducts}
            size="lg"
            variant="outline"
            className="group border-3 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 px-10 py-6 text-xl font-semibold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-green-500/25 min-w-[260px] glass backdrop-blur-xl"
          >
            <Package className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="group-hover:animate-pulse">Our Products</span>
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator - Made smaller and more professional */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-green-600/70 cursor-pointer group">
        <div className="flex flex-col items-center space-y-1 group-hover:text-green-700 transition-colors duration-300">
          <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 bubble-heartbeat" />
          <p className="text-xs font-light group-hover:font-medium transition-all duration-300">Scroll to explore</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
