
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <div id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">About Us</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto text-center">
            PAGBAYAW INC. is dedicated to preserving and promoting local artisanal crafts
            while supporting sustainable practices. Through our platform, we connect skilled
            artisans with appreciative customers, ensuring the continuation of traditional
            craftsmanship in the modern world.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
