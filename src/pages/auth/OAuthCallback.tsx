import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log("🔍 Processing OAuth callback...");
        setStatus("Verifying authentication...");

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          throw new Error("No valid session found");
        }

        const user = session.user;
        console.log("✅ OAuth user authenticated:", user.email);

        // Get the pending role from localStorage
        const pendingRole = localStorage.getItem("pending_role");
        if (!pendingRole) {
          console.warn("No pending role found, defaulting to candidate");
        }

        const selectedRole = pendingRole || "candidate";
        console.log("📝 Assigning role:", selectedRole);

        setStatus("Setting up your account...");

        // Create/update profile
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.full_name || user.email?.split("@")[0],
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.warn("Profile setup warning:", profileError);
        } else {
          console.log("✅ Profile setup complete");
        }

        // Assign user role
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: user.id,
            role: selectedRole
          });

        if (roleError) {
          console.warn("Role assignment warning:", roleError);
        } else {
          console.log("✅ Role assigned:", selectedRole);
        }

        // Handle role-specific setup
        if (selectedRole === "candidate") {
          setStatus("Finalizing candidate setup...");
          
          // Create a basic approved candidate request
          const { error: candidateError } = await supabase
            .from("candidate_onboarding_requests")
            .upsert({
              user_id: user.id,
              data: {
                fullName: user.user_metadata?.full_name || user.email?.split("@")[0],
                experience: "Entry Level",
                goals: "Professional Development",
                skills: [],
                bio: "New candidate - profile incomplete"
              },
              status: "approved"
            });

          if (candidateError) {
            console.warn("Candidate setup warning:", candidateError);
          } else {
            console.log("✅ Candidate setup complete");
          }
        }

        // Clean up localStorage
        localStorage.removeItem("pending_role");

        setStatus("Redirecting...");
        console.log("🎉 OAuth registration completed successfully");

        toast({
          title: "Welcome! 🎉",
          description: "Your account has been created successfully.",
        });

        // Redirect to appropriate dashboard
        setTimeout(() => {
          if (selectedRole === "candidate") {
            navigate("/candidate/dashboard");
          } else if (selectedRole === "mentor") {
            navigate("/mentor/dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1000);

      } catch (error: any) {
        console.error("❌ OAuth callback failed:", error);
        
        setStatus("Setup failed");
        
        toast({
          title: "Setup failed",
          description: error.message || "Please try registering again.",
          variant: "destructive",
        });

        // Redirect to registration with error
        setTimeout(() => {
          navigate("/auth/register");
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Setting up your account</h2>
          <p className="text-muted-foreground">{status}</p>
        </div>
      </div>
    </div>
  );
}
