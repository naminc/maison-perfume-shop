import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageLoader } from "@/components/shared/PageLoader";
import { RouteLoader } from "@/components/shared/RouteLoader";

const Landing = lazy(() => import("@/pages/Landing"));
const Shop = lazy(() => import("@/pages/Shop"));
const Category = lazy(() => import("@/pages/Category"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Search = lazy(() => import("@/pages/Search"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const AccountOverview = lazy(() => import("@/pages/account/AccountOverview"));
const Profile = lazy(() => import("@/pages/account/Profile"));
const Orders = lazy(() => import("@/pages/account/Orders"));
const OrderDetail = lazy(() => import("@/pages/account/OrderDetail"));
const Addresses = lazy(() => import("@/pages/account/Addresses"));
const Wishlist = lazy(() => import("@/pages/account/Wishlist"));
const Security = lazy(() => import("@/pages/account/Security"));
const AppLayout = lazy(() => import("@/layouts/AppLayout"));
const Dashboard = lazy(() => import("@/pages/app/Dashboard"));
const Catalog = lazy(() => import("@/pages/app/Catalog"));
const Movements = lazy(() => import("@/pages/app/Movements"));
const Suppliers = lazy(() => import("@/pages/app/Suppliers"));
const PurchaseOrders = lazy(() => import("@/pages/app/PurchaseOrders"));
const Requests = lazy(() => import("@/pages/app/Requests"));
const Locations = lazy(() => import("@/pages/app/Locations"));
const Analytics = lazy(() => import("@/pages/app/Analytics"));
const AiInsights = lazy(() => import("@/pages/app/AiInsights"));
const Settings = lazy(() => import("@/pages/app/Settings"));
const Help = lazy(() => import("@/pages/app/Help"));

const About = lazy(() => import("@/pages/content/About"));
const Contact = lazy(() => import("@/pages/content/Contact"));
const Faq = lazy(() => import("@/pages/content/Faq"));
const Shipping = lazy(() => import("@/pages/content/Shipping"));
const Returns = lazy(() => import("@/pages/content/Returns"));
const Privacy = lazy(() => import("@/pages/content/Privacy"));
const Terms = lazy(() => import("@/pages/content/Terms"));
const Blog = lazy(() => import("@/pages/content/Blog"));
const BlogPost = lazy(() => import("@/pages/content/BlogPost"));

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <AuthProvider>
    <DemoProvider>
      <RoleProvider>
        <StorefrontProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toaster position="bottom-right" richColors />
        </StorefrontProvider>
      </RoleProvider>
    </DemoProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <>
      <RouteLoader />
      <Suspense fallback={<PageLoader />}>
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

            <Route path="/account" element={<RequireAuth><AccountOverview /></RequireAuth>} />
            <Route path="/account/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/account/orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="/account/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
            <Route path="/account/addresses" element={<RequireAuth><Addresses /></RequireAuth>} />
            <Route path="/account/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
            <Route path="/account/security" element={<RequireAuth><Security /></RequireAuth>} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            <Route path="/auth/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/auth/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/auth/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
            <Route path="/auth/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />
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
      </Suspense>
    </>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!user) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (user) {
    const redirect = new URLSearchParams(location.search).get("redirect");
    return <Navigate to={redirect ?? "/account"} replace />;
  }

  return children;
}
