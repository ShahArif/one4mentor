import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug function to check database state
  const debugDatabaseState = async (userId: string) => {
    try {
      console.log("🔍 Debugging database state for user:", userId);
      
      // Check user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId);
      console.log("👥 User roles:", { roles, rolesError });
      
      // Check candidate onboarding requests
      const { data: candidateRequests, error: candidateError } = await supabase
        .from("candidate_onboarding_requests")
        .select("*")
        .eq("user_id", userId);
      console.log("🎯 Candidate requests:", { candidateRequests, candidateError });
      
      // Check mentor onboarding requests
      const { data: mentorRequests, error: mentorError } = await supabase
        .from("mentor_onboarding_requests")
        .select("*")
        .eq("user_id", userId);
      console.log("🧑‍🏫 Mentor requests:", { mentorRequests, mentorError });
      
      // Check profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId);
      console.log("👤 Profiles:", { profiles, profilesError });
      
    } catch (error) {
      console.error("❌ Debug error:", error);
    }
  };

  // Redirect user based on role and approval status
  const redirectByRole = async (userId: string) => {
    try {
      console.log("🔍 Starting redirectByRole for user:", userId);
      
      // Debug database state first
      await debugDatabaseState(userId);
      
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!error && roles && roles.length > 0) {
        const roleValues = roles.map((r: any) => r.role);
        console.log("✅ User roles found:", roleValues);
        
        // Check onboarding status for the user's role
        let onboardingStatus = null;
        if (roleValues.includes("candidate")) {
          console.log("🔍 Checking candidate onboarding status...");
          const { data: candidateRequest, error: candidateError } = await supabase
            .from("candidate_onboarding_requests")
            .select("status")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(); // Use maybeSingle instead of single to avoid errors
          
          if (candidateError) {
            console.error("❌ Error checking candidate status:", candidateError);
          } else if (candidateRequest) {
            onboardingStatus = candidateRequest.status;
            console.log("✅ Candidate onboarding status:", onboardingStatus);
          } else {
            console.log("⚠️ No candidate onboarding request found");
            onboardingStatus = "not_found";
          }
        } else if (roleValues.includes("mentor")) {
          console.log("🔍 Checking mentor onboarding status...");
          const { data: mentorRequest, error: mentorError } = await supabase
            .from("mentor_onboarding_requests")
            .select("status")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(); // Use maybeSingle instead of single to avoid errors
          
          if (mentorError) {
            console.error("❌ Error checking mentor status:", mentorError);
          } else if (mentorRequest) {
            onboardingStatus = mentorRequest.status;
            console.log("✅ Mentor onboarding status:", onboardingStatus);
          } else {
            console.log("⚠️ No mentor onboarding request found");
            onboardingStatus = "not_found";
          }
        }

        console.log("🎯 Final onboarding status:", onboardingStatus);

        // Redirect based on role and onboarding status
        if (roleValues.includes("super_admin") || roleValues.includes("admin")) {
          console.log("🚀 Redirecting admin to admin dashboard");
          navigate("/admin/dashboard");
        } else if (roleValues.includes("mentor")) {
          if (onboardingStatus === "approved") {
            console.log("🔍 Checking if mentor profile is complete...");
            // Check if profile is complete
            const { data: mentorRequest, error: mentorError } = await supabase
              .from("mentor_onboarding_requests")
              .select("data")
              .eq("user_id", userId)
              .eq("status", "approved")
              .maybeSingle(); // Use maybeSingle to avoid errors
            
            if (mentorError) {
              console.error("❌ Error checking mentor profile data:", mentorError);
              navigate("/onboarding/pending-approval");
            } else if (mentorRequest?.data && Object.keys(mentorRequest.data).length > 1) {
              console.log("🚀 Mentor profile complete, going to dashboard");
              navigate("/mentor/dashboard");
            } else {
              console.log("📝 Mentor profile incomplete, going to onboarding");
              navigate("/onboarding/mentor");
            }
          } else if (onboardingStatus === "pending") {
            console.log("⏳ Mentor approval pending, going to pending approval");
            navigate("/onboarding/pending-approval");
          } else if (onboardingStatus === "not_found") {
            console.log("❓ No mentor onboarding request found, going to pending approval");
            navigate("/onboarding/pending-approval");
          } else {
            console.log("❓ Unknown mentor status, going to pending approval");
            navigate("/onboarding/pending-approval");
          }
        } else if (roleValues.includes("candidate")) {
          if (onboardingStatus === "approved") {
            console.log("🔍 Checking if candidate profile is complete...");
            // Check if profile is complete
            const { data: candidateRequest, error: candidateError } = await supabase
              .from("candidate_onboarding_requests")
              .select("data")
              .eq("user_id", userId)
              .eq("status", "approved")
              .maybeSingle(); // Use maybeSingle to avoid errors
            
            if (candidateError) {
              console.error("❌ Error checking candidate profile data:", candidateError);
              navigate("/onboarding/pending-approval");
            } else if (candidateRequest?.data && Object.keys(candidateRequest.data).length > 1) {
              console.log("🚀 Candidate profile complete, going to dashboard");
              navigate("/candidate/dashboard");
            } else {
              console.log("📝 Candidate profile incomplete, going to onboarding");
              navigate("/onboarding/candidate");
            }
          } else if (onboardingStatus === "pending") {
            console.log("⏳ Candidate approval pending, going to pending approval");
            navigate("/onboarding/pending-approval");
          } else if (onboardingStatus === "not_found") {
            console.log("❓ No candidate onboarding request found, going to pending approval");
            navigate("/onboarding/pending-approval");
          } else {
            console.log("❓ Unknown candidate status, going to pending approval");
            navigate("/onboarding/pending-approval");
          }
        } else {
          console.log("❓ Unknown role, going to pending approval");
          navigate("/onboarding/pending-approval");
        }
      } else {
        console.error("❌ No roles found for user:", userId);
        navigate("/onboarding/pending-approval");
      }
    } catch (error) {
      console.error("❌ Role redirect error:", error);
      navigate("/onboarding/pending-approval");
    }
  };

  // Handle OAuth return and already-authenticated users
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        redirectByRole(session.user.id);
      }
    });

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectByRole(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("🔐 Starting login process...");
      
      // Validate input
      if (!formData.email || !formData.email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }
      
      if (!formData.password || formData.password.length < 1) {
        throw new Error("Please enter your password");
      }

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error || !data.user) {
        console.error("Login error:", error);
        
        let errorMessage = "Please check your credentials and try again.";
        
        if (error?.message?.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error?.message?.includes("Email not confirmed")) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        } else if (error?.message?.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        } else if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        }
        
        throw new Error(errorMessage);
      }

      console.log("✅ Login successful for user:", data.user.email);

      toast({
        title: "Welcome back!",
        description: "Signed in successfully.",
      });

      await redirectByRole(data.user.id);
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/login`,
        },
      });
      
      if (error) throw error;
      
      // OAuth redirect will handle the rest via useEffect
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue your journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
              }
            />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me
            </Label>
          </div>
          <Link 
            to="/auth/forgot-password" 
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Login button */}
        <Button 
          type="submit" 
          className="w-full btn-gradient"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Google login */}
        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-primary hover:underline font-medium">
            Sign up for free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}