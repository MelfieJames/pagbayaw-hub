import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-4 text-gray-600">Welcome to the admin dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;