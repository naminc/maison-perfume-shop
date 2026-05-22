import { Routes, Route, Navigate } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

import Landing from "@/pages/Landing";
import Shop from "@/pages/Shop";
import Category from "@/pages/Category";
import Reviews from "@/pages/Reviews";
import ProductDetail from "@/pages/ProductDetail";
import Search from "@/pages/Search";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import AccountOverview from "@/pages/account/AccountOverview";
import Profile from "@/pages/account/Profile";
import Orders from "@/pages/account/Orders";
import OrderDetail from "@/pages/account/OrderDetail";
import Addresses from "@/pages/account/Addresses";
import Wishlist from "@/pages/account/Wishlist";
import Security from "@/pages/account/Security";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/app/Dashboard";
import Catalog from "@/pages/app/Catalog";
import Movements from "@/pages/app/Movements";
import Suppliers from "@/pages/app/Suppliers";
import PurchaseOrders from "@/pages/app/PurchaseOrders";
import Requests from "@/pages/app/Requests";
import Locations from "@/pages/app/Locations";
import Analytics from "@/pages/app/Analytics";
import AiInsights from "@/pages/app/AiInsights";
import Settings from "@/pages/app/Settings";
import Help from "@/pages/app/Help";

import About from "@/pages/content/About";
import Contact from "@/pages/content/Contact";
import Faq from "@/pages/content/Faq";
import Shipping from "@/pages/content/Shipping";
import Returns from "@/pages/content/Returns";
import Privacy from "@/pages/content/Privacy";
import Terms from "@/pages/content/Terms";
import Blog from "@/pages/content/Blog";
import BlogPost from "@/pages/content/BlogPost";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
    <DemoProvider>
      <RoleProvider>
        <StorefrontProvider>
          <ErrorBoundary>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />

            <Route path="/account" element={<AccountOverview />} />
            <Route path="/account/profile" element={<Profile />} />
            <Route path="/account/orders" element={<Orders />} />
            <Route path="/account/orders/:id" element={<OrderDetail />} />
            <Route path="/account/addresses" element={<Addresses />} />
            <Route path="/account/wishlist" element={<Wishlist />} />
            <Route path="/account/security" element={<Security />} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

            <Route path="/admin" element={<AppLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="movements" element={<Movements />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="requests" element={<Requests />} />
              <Route path="locations" element={<Locations />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="ai-insights" element={<AiInsights />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>

            <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
          <Toaster position="bottom-right" richColors />
        </StorefrontProvider>
      </RoleProvider>
    </DemoProvider>
    </AuthProvider>
  );
}
