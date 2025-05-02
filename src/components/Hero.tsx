import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GradientButton from "@/components/ui/GradientButton";
import { Award, ShoppingBag, ArrowRightCircle } from "lucide-react";

const images = [
  "/lovable-uploads/unvaspic.jpg",
  "/lovable-uploads/unvaspic0.jpg",
  "/lovable-uploads/unvaspic1.jpg",
  "/lovable-uploads/unvaspic2.jpg",
  "/lovable-uploads/unvaspic3.jpg",
  "/lovable-uploads/unvaspic4.jpg",
  "/lovable-uploads/unvaspic5.jpg",
];

export default function Hero() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    setPosition({ x: (clientX - window.innerWidth / 2) / 30, y: (clientY - window.innerHeight / 2) / 30 });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6 bg-gradient-to-br from-[#fefce8] via-[#fdf6e3] to-[#f0ebe1] overflow-hidden">

      {/* Decorative Floating Icon */}
      <div className="absolute top-8 right-8 animate-bounce-slow text-green-500 opacity-30">
        <Award className="w-12 h-16" />
      </div>

      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-sm font-medium tracking-wide text-green-700 shadow-sm">
              <Award className="w-4 h-4 mr-2" />
              Welcome to UNVAS®
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-[#5a3e2b] drop-shadow-lg leading-tight">
              PAGBAYAW INC.
            </h1>

            <p className="text-lg mb-10 max-w-lg mx-auto lg:mx-0 text-[#6b8e68]">
              Celebrating Filipino craftsmanship through sustainable and innovative products that showcase our cultural heritage.
            </p>

            {/* Buttons with Icons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <GradientButton
                size="lg"
                onClick={() => navigate("/achievements")}
                className="bg-[#8b5e3c] text-white hover:bg-[#6b4f3b] shadow-md"
              >
                <Award className="w-5 h-5 mr-2" />
                Our Achievements
              </GradientButton>

              <button
                className="inline-flex items-center text-sm font-medium px-5 py-3 text-[#5a3e2b] hover:text-[#6b8e68] transition-colors duration-200"
                onClick={() => navigate("/products")}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Our Products
                <ArrowRightCircle className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Animated Image Carousel */}
          <div
            className="flex-1 w-full max-w-xl mx-auto"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              className="relative w-full aspect-[3/2] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-transform duration-300"
              style={{
                transform: hover ? `translate(${position.x}px, ${position.y}px)` : "translate(0,0)",
              }}
            >
              {/* Image Container */}
              <div className="relative w-full h-full">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`UNVAS product showcase ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-in-out rounded-3xl ${
                      index === currentImage ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>

              {/* Soft Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
