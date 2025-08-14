import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CandidateOnlyRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function CandidateOnlyRoute({ 
  children, 
  fallbackPath = "/auth/login" 
}: CandidateOnlyRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isCandidate, setIsCandidate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsLoading(true);
        console.log("🔒 CandidateOnlyRoute: Starting access check...");
        
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.log("❌ CandidateOnlyRoute: Auth error:", authError);
          setIsAuthenticated(false);
          setIsCandidate(false);
          setAuthChecked(true);
          return;
        }
        
        if (!user) {
          console.log("❌ CandidateOnlyRoute: User not authenticated, redirecting to login");
          setIsAuthenticated(false);
          setIsCandidate(false);
          setAuthChecked(true);
          return;
        }

        console.log("✅ CandidateOnlyRoute: User authenticated:", user.id);
        setIsAuthenticated(true);

        // Check if user has candidate role
        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (roleError) {
          console.error("❌ CandidateOnlyRoute: Error checking user role:", roleError);
          setIsCandidate(false);
          setAuthChecked(true);
          return;
        }

        // Check if user has candidate role
        const hasCandidateRole = roles?.some(role => role.role === "candidate");
        console.log("🔍 CandidateOnlyRoute: User roles:", roles?.map(r => r.role), "Has candidate role:", hasCandidateRole);
        setIsCandidate(hasCandidateRole);
        setAuthChecked(true);

      } catch (error) {
        console.error("❌ CandidateOnlyRoute: Error checking access:", error);
        setIsAuthenticated(false);
        setIsCandidate(false);
        setAuthChecked(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  // Show loading while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, immediately redirect to login
  if (!isAuthenticated) {
    console.log("🚫 Access denied: User not authenticated, redirecting to:", fallbackPath);
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If not a candidate, redirect to appropriate dashboard
  if (!isCandidate) {
    console.log("🚫 Access denied: User is not a candidate");
    
    // Determine where to redirect based on user role
    const getRedirectPath = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          if (roles && roles.length > 0) {
            const role = roles[0].role;
            if (role === "mentor") {
              return "/mentor/dashboard";
            } else if (role === "admin" || role === "super_admin") {
              return "/admin/dashboard";
            }
          }
        }
        return "/onboarding/pending-approval";
      } catch (error) {
        return "/onboarding/pending-approval";
      }
    };

    // For now, redirect to pending approval, but you could make this async
    return <Navigate to="/onboarding/pending-approval" replace />;
  }

  // If user is a candidate, allow access
  console.log("✅ Access granted: User is a candidate");
  return <>{children}</>;
}
