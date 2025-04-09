
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const Routes = () => {
  return (
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
  );
};

export default Routes;
