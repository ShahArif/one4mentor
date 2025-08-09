import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { debugUserLogin, testPasswordReset, createUserIfNotExists } from "@/utils/debugUser";
import { createCandidateUser, checkUserComplete } from "@/utils/adminActions";
import { debugLogin, testSpecificUser, resetAndCreateCandidate } from "@/utils/debugAuth";
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug functions
  const handleDebugUser = async () => {
    if (!formData.email) {
      toast({
        title: "Enter email first",
        description: "Please enter an email address to debug",
        variant: "destructive"
      });
      return;
    }
    
    const result = await debugUserLogin(formData.email);
    
    if (result.found) {
      toast({
        title: "User Found",
        description: "Check console for detailed user information",
      });
    } else {
      toast({
        title: "User Not Found",
        description: "This user doesn't exist in the database",
        variant: "destructive"
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      toast({
        title: "Enter email first",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    const result = await testPasswordReset(formData.email);
    
    if (result.success) {
      toast({
        title: "Password Reset Sent",
        description: "Check your email for password reset instructions",
      });
    } else {
      toast({
        title: "Password Reset Failed",
        description: result.error?.message || "Failed to send reset email",
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email) {
      toast({
        title: "Enter email first",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    const result = await createUserIfNotExists(formData.email);
    
    if (result.success) {
      toast({
        title: "User Created",
        description: `User created with password: ${result.password}`,
      });
    } else {
      toast({
        title: "Failed to Create User",
        description: result.error?.message || "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleCreateCandidate = async () => {
    if (!formData.email) {
      toast({
        title: "Enter email first",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    const result = await createCandidateUser(formData.email);
    
    if (result.success) {
      toast({
        title: "Candidate Created",
        description: result.message,
      });
    } else {
      toast({
        title: "Failed to Create Candidate",
        description: result.error?.message || "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleCheckComplete = async () => {
    if (!formData.email) {
      toast({
        title: "Enter email first",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    const result = await checkUserComplete(formData.email);
    
    if (result.exists) {
      toast({
        title: "User Analysis Complete",
        description: `Candidate: ${result.isCandidate}, Approved: ${result.hasApprovedCandidateRequest}. Check console for details.`,
      });
    } else {
      toast({
        title: "User Not Found",
        description: "This user doesn't exist in the system",
        variant: "destructive"
      });
    }
  };

  const handleDebugLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Enter credentials first",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    const result = await debugLogin(formData.email, formData.password);
    
    if (result.success) {
      toast({
        title: "Debug Login Successful",
        description: "Login worked! Check console for details.",
      });
    } else {
      toast({
        title: "Debug Login Failed",
        description: result.error || "Check console for details",
        variant: "destructive"
      });
    }
  };

  const handleTestUser = async () => {
    if (!formData.email) {
      toast({
        title: "Enter email first",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    const result = await testSpecificUser(formData.email);
    
    if (result.exists) {
      toast({
        title: "User Analysis Complete",
        description: `User exists, is candidate: ${result.isCandidate}. Check console for details.`,
      });
    } else {
      toast({
        title: "User Not Found",
        description: "This user doesn't exist in the system",
        variant: "destructive"
      });
    }
  };

  const handleResetCandidate = async () => {
    if (!formData.email) {
      toast({
        title: "Enter email first",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    const result = await resetAndCreateCandidate(formData.email);
    
    if (result.success) {
      toast({
        title: "Candidate Reset Complete",
        description: result.message,
      });
    } else {
      toast({
        title: "Reset Failed",
        description: result.error?.message || "Check console for details",
        variant: "destructive"
      });
    }
  };

  // Clean Supabase auth keys to avoid limbo states
  const cleanupAuthState = () => {
    try {
      // Local storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          localStorage.removeItem(key);
        }
      });
      // Session storage
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // no-op
    }
  };

  // Redirect user based on role
  const redirectByRole = async (userId: string) => {
    let target = "/candidate/dashboard";
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!error && roles && roles.length > 0) {
        const roleValues = roles.map((r: any) => r.role);
        if (roleValues.includes("super_admin") || roleValues.includes("admin")) {
          target = "/admin/dashboard";
        } else if (roleValues.includes("mentor")) {
          target = "/mentor/dashboard";
        } else if (roleValues.includes("candidate")) {
          target = "/candidate/dashboard";
        }
      }
    } catch {
      // fall back to default target
    }
    window.location.href = target;
  };

  // Handle OAuth return and already-authenticated users
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Defer to avoid deadlocks
        setTimeout(() => {
          redirectByRole(session.user!.id);
        }, 0);
      }
    });

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
      console.log("Email:", formData.email);
      console.log("Password length:", formData.password?.length);
      
      // Validate input first
      if (!formData.email || !formData.email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }
      
      if (!formData.password || formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Clean up any previous sessions
      console.log("🧹 Cleaning up previous sessions...");
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        // ignore
      }

      console.log("📡 Attempting login with Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("Login response received:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
        errorPresent: !!error
      });

      if (error || !data.user) {
        // Enhanced error logging for debugging
        console.error("Login error details:", {
          error,
          email: formData.email,
          errorMessage: error?.message,
          errorStatus: error?.status,
          errorName: error?.name,
          userData: data?.user
        });
        
        let errorMessage = "Please check your credentials and try again.";
        
        if (error?.status === 400) {
          errorMessage = "Bad request: The login credentials are malformed. Please try again or contact support.";
          console.error("🚨 400 Bad Request - Possible causes:", {
            emailFormat: formData.email.includes("@") ? "valid" : "invalid",
            passwordLength: formData.password?.length,
            trimmedEmail: formData.email.trim(),
            supabaseUrl: supabase.supabaseUrl
          });
        } else if (error?.message?.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. The user may not exist or the password is incorrect.";
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
      
      let displayMessage = error?.message || "Please check your credentials and try again.";
      
      // Add specific guidance for common issues
      if (error?.message?.includes("400") || error?.message?.includes("Bad request")) {
        displayMessage += " If this persists, try using the 'Debug Login' tool below.";
      }
      
      toast({
        title: "Login failed",
        description: displayMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Clean up any previous sessions
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        // ignore
      }

      const redirectUrl = `${window.location.origin}/auth/login`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;

      // After OAuth, Supabase redirects back; useEffect handles the final redirect
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

        {/* Debug Panel - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-orange-800">Debug Tools</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                <Bug className="h-4 w-4 mr-1" />
                {showDebug ? 'Hide' : 'Show'} Debug
              </Button>
            </div>
            
            {showDebug && (
              <div className="space-y-2">
                <p className="text-xs text-orange-700 mb-3">
                  Use these tools to debug login issues. Check browser console for detailed output.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDebugUser}
                    disabled={!formData.email}
                  >
                    Check User
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePasswordReset}
                    disabled={!formData.email}
                  >
                    Reset Password
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateUser}
                    disabled={!formData.email}
                  >
                    Create User
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateCandidate}
                    disabled={!formData.email}
                  >
                    Create Candidate
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCheckComplete}
                    disabled={!formData.email}
                  >
                    Check Complete
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDebugLogin}
                    disabled={!formData.email || !formData.password}
                  >
                    Debug Login
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestUser}
                    disabled={!formData.email}
                  >
                    Test Specific User
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetCandidate}
                    disabled={!formData.email}
                  >
                    Reset Candidate
                  </Button>
                </div>
                
                <div className="mt-3 p-2 bg-white rounded text-xs">
                  <strong>Quick Test:</strong> Enter "zahid@ideas2it.com" and click "Check User" to debug the specific issue.
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </AuthLayout>
  );
}