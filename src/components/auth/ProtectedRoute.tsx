import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
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
  const { user, roles, loading } = useAuth();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<{
    status: string | null;
    isLoading: boolean;
  }>({ status: null, isLoading: true });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || roles.length === 0) {
        setOnboardingStatus({ status: null, isLoading: false });
        return;
      }

      try {
        // Check onboarding status for candidates
        if (roles.includes("candidate")) {
          const { data: candidateRequest } = await supabase
            .from("candidate_onboarding_requests")
            .select("status")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          setOnboardingStatus({
            status: candidateRequest?.status || null,
            isLoading: false
          });
        } else if (roles.includes("mentor")) {
          const { data: mentorRequest } = await supabase
            .from("mentor_onboarding_requests")
            .select("status")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          setOnboardingStatus({
            status: mentorRequest?.status || null,
            isLoading: false
          });
        } else {
          setOnboardingStatus({ status: null, isLoading: false });
        }
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        setOnboardingStatus({ status: null, isLoading: false });
      }
    };

    checkOnboardingStatus();
  }, [user, roles]);

  // Show loading while checking authentication and onboarding status
  if (loading || onboardingStatus.isLoading) {
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
  if (requiredRole && !roles.includes(requiredRole)) {
    // Redirect based on user's actual role
    if (roles.includes("candidate")) {
      return <Navigate to="/candidate/dashboard" replace />;
    } else if (roles.includes("mentor")) {
      return <Navigate to="/mentor/dashboard" replace />;
    } else if (roles.includes("admin") || roles.includes("super_admin")) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // No role assigned - check if they have a pending onboarding request
      if (onboardingStatus.status === "pending") {
        return <Navigate to="/onboarding/pending-approval" replace />;
      } else if (onboardingStatus.status === "rejected") {
        return <Navigate to="/onboarding/rejected" replace />;
      } else {
        // No role and no onboarding request - redirect to appropriate onboarding
        return <Navigate to="/onboarding/candidate" replace />;
      }
    }
  }

  // If user has the required role, check if they need to complete onboarding
  if (roles.includes("candidate") && onboardingStatus.status === "pending") {
    return <Navigate to="/onboarding/pending-approval" replace />;
  }

  if (roles.includes("mentor") && onboardingStatus.status === "pending") {
    return <Navigate to="/onboarding/pending-approval" replace />;
  }

  return <>{children}</>;
}
