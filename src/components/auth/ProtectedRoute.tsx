import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "candidate" | "mentor" | "admin" | "super_admin";
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/auth/login" 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (!error && roles && roles.length > 0) {
          setUserRole(roles[0].role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setRoleLoading(false);
      }
    };

    getUserRole();
  }, [user]);

  // Show loading while checking authentication and role
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on user's actual role
    if (userRole === "candidate") {
      return <Navigate to="/candidate/dashboard" replace />;
    } else if (userRole === "mentor") {
      return <Navigate to="/mentor/dashboard" replace />;
    } else if (userRole === "admin" || userRole === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // No role assigned, redirect to pending approval
      return <Navigate to="/onboarding/pending-approval" replace />;
    }
  }

  return <>{children}</>;
}
