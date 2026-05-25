import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/shared/PageLoader";
import { getSafeRedirectPath } from "@/routes/redirect";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!user) {
    const redirectTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  return children;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!user) {
    const redirectTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/account" replace />;
  }

  return children;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (user) {
    const redirect = getSafeRedirectPath(
      new URLSearchParams(location.search).get("redirect"),
    );
    return <Navigate to={redirect ?? "/account"} replace />;
  }

  return children;
}
