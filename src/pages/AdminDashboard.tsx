import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Award, LogOut, MonitorDashboard, ShoppingBag, Star } from "lucide-react";

const data = [
  { name: 'Q1', value: 400 },
  { name: 'Q2', value: 600 },
  { name: 'Q3', value: 800 },
  { name: 'Q4', value: 1000 },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#8B7355] text-white">
        <div className="p-4 flex items-center gap-2">
          <img src="/lovable-uploads/5c03a00c-16fb-4305-bb33-b3a748c95b67.png" alt="Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-xl font-bold">ADMIN</h1>
        </div>
        
        <nav className="mt-8">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#9b815f] text-white">
            <MonitorDashboard className="w-6 h-6" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Award className="w-6 h-6" />
            <span>Add Achievements</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <ShoppingBag className="w-6 h-6" />
            <span>Add Products</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Star className="w-6 h-6" />
            <span>View Rating</span>
          </a>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white mt-auto"
          >
            <LogOut className="w-6 h-6" />
            <span>Log Out</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="grid gap-6">
          {/* Graph Rating Card */}
          <Card className="rounded-3xl border-2 border-[#C4A484]">
            <CardHeader>
              <CardTitle className="text-[#C4A484] text-3xl">Graph Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <h2 className="text-[#C4A484] text-4xl font-bold">786,999 users</h2>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            {/* Latest Product Card */}
            <Card className="rounded-3xl border-2 border-[#C4A484]">
              <CardHeader>
                <CardTitle className="text-black font-bold">LATEST PRODUCT ADDED</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img src="/placeholder.svg" alt="Necklace" className="w-24 h-24" />
                  <div>
                    <p><span className="font-bold">Product Name:</span> Neckulace</p>
                    <p><span className="font-bold">Category:</span> Necklace</p>
                    <p><span className="font-bold">Price:</span> ₱ 150</p>
                    <button className="mt-2 px-4 py-2 bg-[#8B7355] text-white rounded-md flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      View Products
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Achievement Card */}
            <Card className="rounded-3xl border-2 border-[#C4A484]">
              <CardHeader>
                <CardTitle className="text-black font-bold">LATEST ACHIEVEMENT ADDED</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img src="/placeholder.svg" alt="Achievement" className="w-24 h-24" />
                  <div>
                    <p><span className="font-bold">Achievement Name:</span></p>
                    <p>Golden Horizon Award</p>
                    <button className="mt-2 px-4 py-2 bg-[#8B7355] text-white rounded-md flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      View Achievements
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;