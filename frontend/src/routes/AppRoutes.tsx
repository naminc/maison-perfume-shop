import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageLoader } from "@/components/shared/PageLoader";
import { RouteLoader } from "@/components/shared/RouteLoader";
import { AdminGuestOnly, GuestOnly, RequireAdmin, RequireAuth } from "@/routes/guards";

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
const AccountReviews = lazy(() => import("@/pages/account/Reviews"));
const Addresses = lazy(() => import("@/pages/account/Addresses"));
const Wishlist = lazy(() => import("@/pages/account/Wishlist"));
const Security = lazy(() => import("@/pages/account/Security"));
const AppLayout = lazy(() => import("@/layouts/AppLayout"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const Brands = lazy(() => import("@/pages/admin/Brands"));
const Catalog = lazy(() => import("@/pages/admin/Catalog"));
const Products = lazy(() => import("@/pages/admin/Products"));
const AdminProductReviews = lazy(() => import("@/pages/admin/ProductReviews"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const Contacts = lazy(() => import("@/pages/admin/Contacts"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const AdminNotFound = lazy(() => import("@/pages/admin/AdminNotFound"));

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

export function AppRoutes() {
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
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />

          <Route path="/account" element={<RequireAuth><AccountOverview /></RequireAuth>} />
          <Route path="/account/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/account/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/account/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="/account/reviews" element={<RequireAuth><AccountReviews /></RequireAuth>} />
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

          <Route path="/admin/login" element={<AdminGuestOnly><AdminLogin /></AdminGuestOnly>} />
          <Route path="/admin" element={<RequireAdmin><AppLayout /></RequireAdmin>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brands />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="products" element={<Products />} />
            <Route path="product-reviews" element={<AdminProductReviews />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/admin/*" element={<RequireAdmin><AdminNotFound /></RequireAdmin>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
