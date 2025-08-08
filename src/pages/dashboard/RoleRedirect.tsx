import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export default function RoleRedirect() {
  const { user, loading, roles } = useAuth();

  useEffect(() => {
    document.title = "Preplaced | Dashboard";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (roles.includes("super_admin") || roles.includes("admin")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (roles.includes("mentor")) {
    return <Navigate to="/mentor/dashboard" replace />;
  }

  // Default to candidate
  return <Navigate to="/candidate/dashboard" replace />;
}