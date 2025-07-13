
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Trophy, ShoppingBag, Star, Calendar, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LatestAchievements = () => {
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["landing-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    refetchOnWindowFocus: false,
  });
  const navigate = useNavigate();
  
  return (
    <section className="py-20 relative overflow-hidden" id="achievements">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/lovable-uploads/unvaspic2.jpg')" }}>
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
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg bubble-heartbeat">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Latest Achievements
            </h2>
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg bubble-heartbeat animation-delay-1000">
              <Star className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Celebrating our recent milestones and outstanding accomplishments
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {isLoading ? (
            <div className="col-span-3 text-center">
              <div className="inline-flex items-center gap-3 text-white text-lg">
                <div className="bubble-heartbeat rounded-full h-6 w-6 border-b-2 border-white"></div>
                Loading amazing achievements...
              </div>
            </div>
          ) : achievements.length === 0 ? (
            <div className="col-span-3 text-center text-white/80 text-lg">
              No achievements yet. Stay tuned for exciting updates!
            </div>
          ) : achievements.map((ach, index) => (
            <div 
              key={ach.id} 
              className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col items-center card-hover animate-fade-in-up glass transform hover:scale-105 transition-all duration-500"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-200 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:border-green-300 transition-colors duration-300">
                  <img 
                    src={ach.image || "/placeholder.svg"} 
                    alt={ach.achievement_name} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 bubble-heartbeat">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-green-800 mb-3 text-center group-hover:text-green-600 transition-colors duration-300">
                {ach.achievement_name}
              </h3>
              
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <MapPin className="h-4 w-4" />
                <p className="text-sm font-medium">{ach.venue}</p>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <Calendar className="h-4 w-4" />
                <p className="text-sm">{new Date(ach.date).toLocaleDateString()}</p>
              </div>
              
              <p className="text-sm text-gray-700 text-center leading-relaxed line-clamp-3">
                {ach.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center animate-scale-in animation-delay-1000">
          <button
            onClick={() => navigate("/achievements")}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-green-500/25 min-w-[280px] animate-glow"
          >
            <Trophy className="inline-block mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="group-hover:animate-pulse">View All Achievements</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const LatestProducts = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["landing-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    refetchOnWindowFocus: false,
  });
  const navigate = useNavigate();
  
  return (
    <section className="py-20 relative overflow-hidden" id="products">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/lovable-uploads/unvaspic3.jpg')" }}>
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
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg bubble-heartbeat">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Latest Products
            </h2>
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg bubble-heartbeat animation-delay-1000">
              <Star className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover our newest eco-friendly products crafted with excellence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {isLoading ? (
            <div className="col-span-3 text-center">
              <div className="inline-flex items-center gap-3 text-white text-lg">
                <div className="bubble-heartbeat rounded-full h-6 w-6 border-b-2 border-white"></div>
                Loading amazing products...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-3 text-center text-white/80 text-lg">
              No products yet. Stay tuned for exciting launches!
            </div>
          ) : products.map((prod, index) => (
            <div 
              key={prod.id} 
              className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col items-center card-hover animate-fade-in-up glass transform hover:scale-105 transition-all duration-500"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-green-200 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:border-green-300 transition-colors duration-300">
                  <img 
                    src={prod.image || "/placeholder.svg"} 
                    alt={prod.product_name} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 bubble-heartbeat">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-green-800 mb-3 text-center group-hover:text-green-600 transition-colors duration-300">
                {prod.product_name}
              </h3>
              
              <div className="text-2xl font-bold text-green-600 mb-2">
                ₱{prod.product_price?.toFixed(2)}
              </div>
              
              <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-4">
                {prod.category}
              </div>
              
              <p className="text-sm text-gray-700 text-center leading-relaxed line-clamp-3">
                {prod.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center animate-scale-in animation-delay-1000">
          <button
            onClick={() => navigate("/products")}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-green-500/25 min-w-[280px] animate-glow"
          >
            <ShoppingBag className="inline-block mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="group-hover:animate-pulse">View All Products</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <LatestAchievements />
      <LatestProducts />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
