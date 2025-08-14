import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OAuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log("🔄 Processing OAuth callback...");
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (!session?.user) {
          throw new Error("No user session found after OAuth");
        }
        
        console.log("✅ OAuth user authenticated:", session.user.email);
        
        // Get the pending role from localStorage
        const pendingRole = localStorage.getItem("pending_role");
        localStorage.removeItem("pending_role"); // Clean up
        
        if (pendingRole) {
          console.log("🔧 Setting up user with role:", pendingRole);
          
          // Check if profile already exists
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileCheckError) {
            console.warn("⚠️ Error checking existing profile:", profileCheckError);
          } else if (existingProfile) {
            console.log("⚠️ Profile already exists for user:", session.user.id);
          } else {
            // Create profile only if it doesn't exist
            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || "User",
                created_at: new Date().toISOString()
              });
            
            if (profileError) {
              console.warn("⚠️ Profile creation warning:", profileError);
            } else {
              console.log("✅ Profile created");
            }
          }
          
          // Check if role already exists
          const { data: existingRole, error: roleCheckError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (roleCheckError) {
            console.warn("⚠️ Error checking existing role:", roleCheckError);
          } else if (existingRole) {
            console.log("⚠️ Role already assigned for user:", session.user.id, "Role:", existingRole.role);
          } else {
            // Assign role only if it doesn't exist
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: session.user.id,
                role: pendingRole // This will be "candidate" or "mentor" based on user's choice
              });
            
            if (roleError) {
              console.warn("⚠️ Role assignment warning:", roleError);
            } else {
              console.log("✅ Role assigned:", pendingRole);
            }
          }
          
          // Handle role-specific setup
          if (pendingRole === "candidate") {
            // Check if candidate onboarding request already exists
            const { data: existingCandidateRequest, error: candidateCheckError } = await supabase
              .from("candidate_onboarding_requests")
              .select("id")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (candidateCheckError) {
              console.warn("⚠️ Error checking existing candidate request:", candidateCheckError);
            } else if (existingCandidateRequest) {
              console.log("⚠️ Candidate onboarding request already exists for user:", session.user.id);
            } else {
              const { error: candidateError } = await supabase
                .from("candidate_onboarding_requests")
                .insert({
                  user_id: session.user.id,
                  data: {
                    fullName: session.user.user_metadata?.display_name || "New Candidate",
                    // No other details - user must complete profile after admin approval
                  },
                  status: "pending" // Changed to "pending" - requires admin approval
                });
              
              if (candidateError) {
                console.warn("⚠️ Candidate setup warning:", candidateError);
              }
            }
          } else if (pendingRole === "mentor") {
            // Check if mentor onboarding request already exists
            const { data: existingMentorRequest, error: mentorCheckError } = await supabase
              .from("mentor_onboarding_requests")
              .select("id")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (mentorCheckError) {
              console.warn("⚠️ Error checking existing mentor request:", mentorCheckError);
            } else if (existingMentorRequest) {
              console.log("⚠️ Mentor onboarding request already exists for user:", session.user.id);
            } else {
              const { error: mentorError } = await supabase
                .from("mentor_onboarding_requests")
                .insert({
                  user_id: session.user.id,
                  data: {
                    fullName: session.user.user_metadata?.display_name || "New Mentor",
                    // No other details - user must complete profile after admin approval
                  },
                  status: "pending" // Changed to "pending" - requires admin approval
                });
              
              if (mentorError) {
                console.warn("⚠️ Mentor setup warning:", mentorError);
              }
            }
          }
        }
        
        setStatus("success");
        setMessage("Account setup complete! Redirecting...");
        
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          // All users go to pending approval first
          navigate("/onboarding/pending-approval");
        }, 1500);
        
      } catch (error: any) {
        console.error("❌ OAuth callback error:", error);
        setStatus("error");
        setMessage(error.message || "Failed to complete account setup");
        
        toast({
          title: "Setup failed",
          description: "There was an error setting up your account. Please try again.",
          variant: "destructive",
        });
        
        // Redirect to login after error
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      }
    };
    
    handleOAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Setting up your account...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we complete your registration.
              </p>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Account created!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </>
          )}
          
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Setup failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
