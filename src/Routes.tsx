import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Public Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import Achievements from "@/pages/Achievements";
import AchievementDetail from "@/pages/AchievementDetail";
import AboutUs from "@/pages/AboutUs";

// User Protected Pages
import UserProfile from "@/pages/UserProfile";
import Checkout from "@/pages/Checkout";
import MyRatings from "@/pages/MyRatings";
import PurchaseHistory from "@/pages/PurchaseHistory";

// Admin Protected Pages
import AdminDashboard from "@/pages/AdminDashboard";
import ProductManagement from "@/pages/ProductManagement";
import AchievementManagement from "@/pages/AchievementManagement";
import SendNotificationForm from "@/components/admin/SendNotificationForm"; 
import AdminPurchasesPage from "@/components/products/AdminPurchasesPage"; // ✅ Import the new Purchases page

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

      {/* User Protected Routes */}
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
        path="/purchase-history"
        element={
          <ProtectedRoute>
            <PurchaseHistory />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
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
      <Route
        path="/admin/send-notification"
        element={
          <ProtectedRoute requireAdmin>
            <SendNotificationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/purchases" // ✅ Add the Purchases Management Route
        element={
          <ProtectedRoute requireAdmin>
            <AdminPurchasesPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
};

export default Routes;
