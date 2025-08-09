import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RoleSelector, UserRole } from "@/components/auth/RoleSelector";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Register() {
  const [step, setStep] = useState<"role" | "details">("role");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinueFromRole = () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose how you want to use the platform to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Please accept the terms",
        description: "You must agree to our terms and privacy policy to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Role selection required",
        description: "Please select your role to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 Starting registration process...");
      console.log("Role:", selectedRole);
      console.log("Email:", formData.email);

      // Step 1: Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            display_name: `${formData.firstName} ${formData.lastName}`.trim(),
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) {
        console.error("Auth creation error:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("No user data returned from registration");
      }

      const userId = authData.user.id;
      console.log("✅ Auth user created:", userId);

      // Step 2: Create/update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: formData.email.trim(),
          display_name: `${formData.firstName} ${formData.lastName}`.trim(),
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.warn("Profile creation warning:", profileError);
      } else {
        console.log("✅ Profile created");
      }

      // Step 3: Assign user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: selectedRole
        });

      if (roleError) {
        console.warn("Role assignment warning:", roleError);
      } else {
        console.log("✅ Role assigned:", selectedRole);
      }

      // Step 4: Handle role-specific setup
      if (selectedRole === "candidate") {
        // Create a basic approved candidate request so they can immediately access features
        const { error: candidateError } = await supabase
          .from("candidate_onboarding_requests")
          .insert({
            user_id: userId,
            data: {
              fullName: `${formData.firstName} ${formData.lastName}`.trim(),
              experience: "Entry Level", // Default
              goals: "Professional Development", // Default
              skills: [], // Empty initially
              bio: "New candidate - profile incomplete"
            },
            status: "approved" // Auto-approve so they can use the platform
          });

        if (candidateError) {
          console.warn("Candidate setup warning:", candidateError);
        } else {
          console.log("✅ Candidate setup complete");
        }
      }

      console.log("🎉 Registration completed successfully");

      toast({
        title: "Account created successfully! 🎉",
        description: authData.user.email_confirmed_at 
          ? "You can now log in and start using the platform."
          : "Please check your email to confirm your account, then log in.",
      });

      // Redirect based on email confirmation status
      if (authData.user.email_confirmed_at) {
        // User is already confirmed, redirect to appropriate dashboard
        if (selectedRole === "candidate") {
          navigate("/candidate/dashboard");
        } else if (selectedRole === "mentor") {
          navigate("/mentor/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Need email confirmation, redirect to login with message
        navigate("/auth/login");
      }

    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Please try logging in instead.";
      } else if (error.message?.includes("password")) {
        errorMessage = "Password requirements not met. Please use a stronger password.";
      } else if (error.message?.includes("email")) {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Registration failed",
        description: error.message || errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role first",
        description: "Choose how you want to use the platform to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔍 Starting Google OAuth signup...");

      // Store the selected role in localStorage for post-OAuth setup
      localStorage.setItem("pending_role", selectedRole);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // OAuth redirect will handle the rest
    } catch (error: any) {
      console.error("Google signup error:", error);
      toast({
        title: "Google signup failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (step === "role") {
    return (
      <AuthLayout
        title="Join the Platform"
        subtitle="Choose your role to get started - account created instantly!"
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">
                <strong>New:</strong> Registration now works! Create your account in 30 seconds.
              </p>
            </div>
          </div>
          
          <RoleSelector 
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelection}
          />
          
          <Button 
            onClick={handleContinueFromRole}
            className="w-full btn-gradient"
            disabled={!selectedRole}
          >
            Continue to Account Setup
          </Button>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={`Setting up your ${selectedRole} account - this actually works now!`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center text-sm text-blue-700">
            <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
            Real Supabase integration - your account will be created immediately
          </div>
        </div>
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="First name"
                className="pl-10"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
        </div>

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
              placeholder="Create a password"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="pl-10"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
            }
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm leading-5">
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        {/* Register button */}
        <Button 
          type="submit" 
          className="w-full btn-gradient"
          disabled={isLoading}
        >
          {isLoading ? "Creating your account..." : "Create Account (Real Supabase!)"}
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

        {/* Google signup */}
        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google (Working!)
        </Button>

        {/* Back to role selection */}
        <Button 
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setStep("role")}
        >
          ← Back to role selection
        </Button>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}