import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FDE1D3]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1582562124811-c09040d0a901')"
        }}
      />
      
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900">
          PAGBAYAW INC.
        </h1>
        <p className="text-2xl md:text-3xl text-gray-700 mb-8 font-light">
          Supporting local artisans and sustainable craftsmanship
        </p>
        <Button
          size="lg"
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default Hero;