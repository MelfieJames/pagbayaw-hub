
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import PurchaseHistory from "./pages/PurchaseHistory";
import Checkout from "./pages/Checkout";
import ProductManagement from "./pages/ProductManagement";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import AdminChatbotPage from "./pages/AdminChatbotPage";
import OrderApprovalPage from "./pages/OrderApprovalPage";
import Achievements from "./pages/Achievements";
import AchievementDetail from "./pages/AchievementDetail";
import AchievementManagement from "./pages/AchievementManagement";
import MyRatings from "./pages/MyRatings";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import UserManagementPage from "./pages/UserManagementPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/purchase-history" element={<PurchaseHistory />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/orders" element={<OrderApprovalPage />} />
      <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
      <Route path="/admin/chatbot" element={<AdminChatbotPage />} />
      <Route path="/admin/reviews" element={<AdminReviewsPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/achievements/:id" element={<AchievementDetail />} />
      <Route path="/admin/achievements" element={<AchievementManagement />} />
      <Route path="/my-ratings" element={<MyRatings />} />
    </Routes>
  );
}
