
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
    <section className="py-16 bg-gradient-to-b from-[#F9F6F2] via-[#F3EBDD] to-[#E9DFD0] relative overflow-hidden" id="achievements">
      {/* Decorative background pattern for achievements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#F3EBDD] rounded-full opacity-30 blur-2xl" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-[#E9DFD0] rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-[#BFA77A] rounded-full opacity-10 blur-2xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[#8B7355] mb-8 flex items-center gap-3 drop-shadow-lg">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#E9DFD0] to-[#BFA77A] shadow-lg mr-2"><Trophy className="h-8 w-8 text-[#8B7355]" /></span> Latest Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-3 text-center text-[#8B7355]">Loading...</div>
          ) : achievements.length === 0 ? (
            <div className="col-span-3 text-center text-[#8B7355]">No achievements yet.</div>
          ) : achievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white/90 rounded-2xl shadow-xl border border-[#E9DFD0] p-7 flex flex-col items-center hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up group relative cursor-pointer overflow-hidden ring-1 ring-[#F3EBDD] group-hover:ring-4 group-hover:ring-[#BFA77A]"
              onClick={() => navigate(`/achievements?id=${ach.id}`)}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-1/2 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#E9DFD0]/60 to-transparent rotate-12 animate-shine" />
              </div>
              <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-[#E9DFD0] bg-gradient-to-br from-[#F3EBDD] to-[#BFA77A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <img src={ach.image || "/placeholder.svg"} alt={ach.achievement_name} className="object-cover w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-[#8B7355] mb-2 flex items-center gap-2 group-hover:text-[#6D5A42] transition-colors drop-shadow">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#E9DFD0] to-[#BFA77A] shadow-md"><Trophy className="h-5 w-5 text-[#8B7355] animate-bounce group-hover:animate-pulse" /></span> {ach.achievement_name}
              </h3>
              <p className="text-sm text-[#6D5A42] mb-1 font-medium">{ach.venue}</p>
              <p className="text-xs text-[#BFA77A] mb-2">{new Date(ach.date).toLocaleDateString()}</p>
              <p className="text-sm text-[#6D5A42]/80 line-clamp-3 group-hover:line-clamp-none transition-all font-light">{ach.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate("/achievements")}
            className="bg-gradient-to-r from-[#E9DFD0] to-[#BFA77A] hover:from-[#BFA77A] hover:to-[#8B7355] text-[#6D5A42] px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl min-w-[220px] group border-none"
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
    <section className="py-16 bg-gradient-to-b from-[#F8FFFB] via-[#E9F8F3] to-[#DFF5EC] relative overflow-hidden" id="products">
      {/* Decorative background pattern for products */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#E9F8F3] rounded-full opacity-30 blur-2xl" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-[#DFF5EC] rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 right-1/2 w-24 h-24 bg-[#A7E9C5] rounded-full opacity-10 blur-2xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1B5E3C] mb-8 flex items-center gap-3 drop-shadow-lg">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#A7E9C5] to-[#1B5E3C] shadow-lg mr-2"><ShoppingBag className="h-8 w-8 text-white" /></span> Latest Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-3 text-center text-[#1B5E3C]">Loading...</div>
          ) : products.length === 0 ? (
            <div className="col-span-3 text-center text-[#1B5E3C]">No products yet.</div>
          ) : products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl shadow-lg border border-[#A7E9C5] p-7 flex flex-col items-center hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up group relative cursor-pointer overflow-hidden ring-1 ring-[#E9F8F3] group-hover:ring-4 group-hover:ring-[#1B5E3C]"
              onClick={() => navigate(`/products?id=${prod.id}`)}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-1/2 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#A7E9C5]/60 to-transparent rotate-12 animate-shine" />
              </div>
              <div className="w-28 h-28 rounded-xl overflow-hidden mb-4 border-4 border-[#A7E9C5] bg-gradient-to-br from-[#E9F8F3] to-[#A7E9C5] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <img src={prod.image || "/placeholder.svg"} alt={prod.product_name} className="object-cover w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-[#1B5E3C] mb-2 flex items-center gap-2 group-hover:text-[#388E5C] transition-colors drop-shadow">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#A7E9C5] to-[#1B5E3C] shadow-md"><ShoppingBag className="h-5 w-5 text-white animate-bounce group-hover:animate-pulse" /></span> {prod.product_name}
              </h3>
              <p className="text-sm text-[#222] mb-1 font-medium">₱{prod.product_price?.toFixed(2)}</p>
              <p className="text-xs text-[#555] mb-2">{prod.category}</p>
              <p className="text-sm text-[#444]/90 line-clamp-3 group-hover:line-clamp-none transition-all font-light">{prod.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-10">
          <button
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-[#A7E9C5] to-[#1B5E3C] hover:from-[#1B5E3C] hover:to-[#388E5C] text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl min-w-[220px] group border-none h-20"
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
