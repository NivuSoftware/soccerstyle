import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { ADMIN_DASHBOARD_PATH } from "@/lib/admin-routes";

const PublicAdminRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Preparando acceso interno...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />;
  }

  return <Outlet />;
};

export default PublicAdminRoute;
