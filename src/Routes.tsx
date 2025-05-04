
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Products from "@/pages/Products";
import Achievements from "@/pages/Achievements";
import AchievementDetail from "@/pages/AchievementDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UserProfile from "@/pages/UserProfile";
import AchievementManagement from "@/pages/AchievementManagement";
import ProductManagement from "@/pages/ProductManagement";
import AdminDashboard from "@/pages/AdminDashboard";
import MyRatings from "@/pages/MyRatings";
import PurchaseHistory from "@/pages/PurchaseHistory";
import Checkout from "@/pages/Checkout";
import AdminPurchasesPage from "@/components/products/AdminPurchasesPage";
import AdminNotificationsPage from "@/pages/AdminNotificationsPage";
import OrderApprovalPage from "@/pages/OrderApprovalPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/products" element={<Products />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/achievements/:id" element={<AchievementDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/my-ratings" element={<MyRatings />} />
      <Route path="/purchase-history" element={<PurchaseHistory />} />
      <Route path="/checkout" element={<Checkout />} />
      
      {/* Admin pages */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/achievements" element={<AchievementManagement />} />
      <Route path="/admin/purchases" element={<AdminPurchasesPage />} />
      <Route path="/admin/send-notification" element={<AdminNotificationsPage />} />
      <Route path="/admin/order-approval" element={<OrderApprovalPage />} />
    </Routes>
  );
}
