
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Trophy, ShoppingBag } from "lucide-react";
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
    <section className="py-16 bg-gradient-to-b from-amber-100 to-orange-50" id="achievements">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" /> Latest Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-3 text-center text-amber-700">Loading...</div>
          ) : achievements.length === 0 ? (
            <div className="col-span-3 text-center text-amber-700">No achievements yet.</div>
          ) : achievements.map((ach) => (
            <div key={ach.id} className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6 flex flex-col items-center hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
              <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-yellow-200 bg-amber-50 flex items-center justify-center">
                <img src={ach.image || "/placeholder.svg"} alt={ach.achievement_name} className="object-cover w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> {ach.achievement_name}
              </h3>
              <p className="text-sm text-amber-700 mb-1">{ach.venue}</p>
              <p className="text-xs text-gray-500 mb-2">{new Date(ach.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-700 line-clamp-3">{ach.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate("/achievements")}
            className="bg-[#8B7355] hover:bg-[#6D5A42] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl min-w-[220px] group"
          >
            <span className="group-hover:animate-pulse">Our Achievements</span>
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
    <section className="py-16 bg-gradient-to-b from-orange-50 to-amber-100" id="products">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-orange-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-green-600" /> Latest Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-3 text-center text-orange-700">Loading...</div>
          ) : products.length === 0 ? (
            <div className="col-span-3 text-center text-orange-700">No products yet.</div>
          ) : products.map((prod) => (
            <div key={prod.id} className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6 flex flex-col items-center hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
              <div className="w-28 h-28 rounded-xl overflow-hidden mb-4 border-4 border-green-200 bg-green-50 flex items-center justify-center">
                <img src={prod.image || "/placeholder.svg"} alt={prod.product_name} className="object-cover w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-green-600" /> {prod.product_name}
              </h3>
              <p className="text-sm text-green-700 mb-1">₱{prod.product_price?.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mb-2">{prod.category}</p>
              <p className="text-sm text-gray-700 line-clamp-3">{prod.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate("/products")}
            className="bg-[#8B7355] hover:bg-[#6D5A42] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl min-w-[220px] group"
          >
            <span className="group-hover:animate-pulse">Our Products</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-100">
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
