
import { Routes as RouterRoutes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import Achievements from "@/pages/Achievements";
import AdminDashboard from "@/pages/AdminDashboard";
import ProductManagement from "@/pages/ProductManagement";
import AchievementManagement from "@/pages/AchievementManagement";
import Checkout from "@/pages/Checkout";
import AchievementDetail from "@/pages/AchievementDetail";
import MyRatings from "@/pages/MyRatings";
import UserProfile from "@/pages/UserProfile";
import PurchaseHistory from "@/pages/PurchaseHistory";
import AboutUs from "@/pages/AboutUs";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// Component to check if user is admin and redirect accordingly
const AdminRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking admin status:", error);
          return;
        }

        const isAdmin = !!data;
        
        // Only redirect to admin if we're on the index page and user is admin
        if (isAdmin && location.pathname === '/') {
          navigate('/admin');
        }
      } catch (err) {
        console.error("Exception checking admin status:", err);
      }
    };

    checkAdminStatus();
  }, [user, navigate, location.pathname]);

  return null;
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    // For admin routes, we'll check directly here
    const isAdmin = user.isAdmin;
    if (!isAdmin) {
      console.log("User is not admin, redirecting to home");
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

const Routes = () => {
  return (
    <>
      <AdminRedirect />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/achievements/:id" element={<AchievementDetail />} />
        <Route path="/about" element={<AboutUs />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ratings"
          element={
            <ProtectedRoute>
              <MyRatings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <PurchaseHistory />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin>
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/achievements"
          element={
            <ProtectedRoute requireAdmin>
              <AchievementManagement />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </>
  );
};

export default Routes;
