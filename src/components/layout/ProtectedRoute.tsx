import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, hasAnyRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = "Preplaced | Secure";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}