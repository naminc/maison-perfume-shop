import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { MaintenanceGate } from "@/components/shared/MaintenanceGate";
import { SiteSettingsMeta } from "@/components/site/SiteSettingsMeta";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <StorefrontProvider>
        <ErrorBoundary>
          <SiteSettingsMeta />
          <MaintenanceGate>
            <AppRoutes />
          </MaintenanceGate>
        </ErrorBoundary>
        <Toaster position="bottom-right" richColors />
      </StorefrontProvider>
    </AuthProvider>
  );
}
