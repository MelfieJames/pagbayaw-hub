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

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
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

      {/* Protected Routes */}
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <Achievements />
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