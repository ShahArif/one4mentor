import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

// Reusable logout hook with robust cleanup to avoid auth limbo states
export function useLogout() {
  const { toast } = useToast();
  const location = useLocation();

  const cleanupAuthState = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // no-op
    }
  };

  const logout = async () => {
    try {
      // Clean local/session storage first
      cleanupAuthState();
      // Attempt global sign out (ignore failures)
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        // ignore
      }
      toast({ title: "Signed out", description: "You have been logged out successfully." });

      // Redirect based on context (admins back to /admin, others to login)
      const isAdminSection = location.pathname.startsWith("/admin");
      window.location.href = isAdminSection ? "/admin" : "/auth/login";
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
      window.location.href = "/auth/login";
    }
  };

  return { logout };
}
