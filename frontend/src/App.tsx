import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <StorefrontProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <Toaster position="bottom-right" richColors />
      </StorefrontProvider>
    </AuthProvider>
  );
}
