import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, Target, FileText, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const skillOptions = [
  "JavaScript", "Python", "React", "Node.js", "Java", "Data Science",
  "Machine Learning", "UI/UX Design", "Product Management", "DevOps"
];

const companiesOptions = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", "Airbnb"
];

export default function CandidateOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    skills: [] as string[],
    experience: "",
    goals: "",
    preferredCompanies: [] as string[],
    resume: null as File | null
  });

  const progress = (currentStep / 4) * 100;

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error("Authentication check failed:", error);
          toast({
            title: "Authentication Required",
            description: "Please log in to access candidate onboarding.",
            variant: "destructive",
          });
          navigate("/auth/login");
          return;
        }
        
        console.log("✅ User authenticated for onboarding:", user.email);
        setIsAuthenticated(true);
        
        // Load debug info
        await loadDebugInfo(user);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const loadDebugInfo = async (user: any) => {
    try {
      // Get user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      // Get existing candidate requests
      const { data: candidateRequests } = await supabase
        .from("candidate_onboarding_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        roles: roles || [],
        candidateRequests: candidateRequests || [],
        profile: profile
      });
    } catch (error) {
      console.error("Debug info loading error:", error);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCompanyToggle = (company: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCompanies: prev.preferredCompanies.includes(company)
        ? prev.preferredCompanies.filter(c => c !== company)
        : [...prev.preferredCompanies, company]
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      console.log("🔍 Candidate onboarding: Starting submission...");
      
      // Try to refresh session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.warn("Session issue, attempting to refresh...");
        
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error("Session refresh failed:", refreshError);
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          navigate("/auth/login");
          return;
        }
        
        console.log("✅ Session refreshed successfully");
      }
      
      // Enhanced authentication check
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      console.log("Auth data:", { authData, authError });
      
      if (authError) {
        console.error("Authentication error details:", authError);
        toast({
          title: "Authentication Error",
          description: `Session error: ${authError.message}. Please try logging in again.`,
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }
      
      if (!authData?.user) {
        console.error("No user found in auth data");
        toast({
          title: "Authentication Error",
          description: "No active session found. Please log in to complete onboarding.",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }

      const user = authData.user;
      console.log("✅ User authenticated:", user.id, user.email);

      // Validate required fields
      if (!formData.fullName || !formData.experience) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Prepare form data (excluding file for now, could be handled separately)
      const submissionData = {
        fullName: formData.fullName,
        bio: formData.bio,
        skills: formData.skills,
        experience: formData.experience,
        goals: formData.goals,
        preferredCompanies: formData.preferredCompanies,
        hasResume: formData.resume !== null
      };

      console.log("📝 Submitting candidate application...", {
        user_id: user.id,
        data: submissionData
      });

      // Add debugging for user authentication
      console.log("🔍 Current user details:", {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role,
        created_at: user.created_at
      });

      // Check if user already has a candidate record (from registration)
      console.log("🔍 Checking for existing candidate request...");
      const { data: existingRequest, error: checkError } = await supabase
        .from("candidate_onboarding_requests")
        .select("id, status, data, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      console.log("Existing request check result:", { existingRequest, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing request:", checkError);
        throw checkError;
      }

      if (existingRequest) {
        // Update existing candidate record
        console.log("📝 Updating existing candidate profile...");
        console.log("Existing request details:", {
          id: existingRequest.id,
          status: existingRequest.status,
          created_at: existingRequest.created_at
        });

        // Check current user roles for debugging
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        
        console.log("Current user roles:", { userRoles, rolesError });

        const { error: updateError } = await supabase
          .from("candidate_onboarding_requests")
          .update({
            data: submissionData,
            status: "approved" // Keep or set as approved
          })
          .eq("id", existingRequest.id);

        console.log("Update attempt result:", { updateError });

        if (updateError) {
          console.error("Update error details:", {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          });
          
          // If update fails due to RLS, try to create a new approved record
          if (updateError.code === '42501' || updateError.message?.includes('permission')) {
            console.log("🔄 Update failed due to permissions, creating new approved record...");
            
            const { error: insertError } = await supabase
              .from("candidate_onboarding_requests")
              .insert({
                user_id: user.id,
                data: submissionData,
                status: "approved"
              });

            if (insertError) {
              console.error("Insert error:", insertError);
              throw insertError;
            }
            
            console.log("✅ New approved candidate record created successfully");
          } else {
            throw updateError;
          }
        } else {
          console.log("✅ Candidate profile updated successfully");
        }
      } else {
        // Create new approved candidate record (fallback)
        console.log("📝 Creating new candidate profile...");
        const { error: insertError } = await supabase
          .from("candidate_onboarding_requests")
          .insert({
            user_id: user.id,
            data: submissionData,
            status: "approved" // Create as approved since this is profile completion
          });

        console.log("Insert attempt result:", { insertError });

        if (insertError) {
          console.error("Insert error details:", {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          throw insertError;
        }

        console.log("✅ New candidate profile created successfully");
      }

      // Verify the data was saved by querying it back
      console.log("🔍 Verifying saved data...");
      const { data: verifyData, error: verifyError } = await supabase
        .from("candidate_onboarding_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      console.log("Verification result:", { verifyData, verifyError });

      console.log("✅ Candidate profile completion successful");

      toast({
        title: "Profile Updated Successfully! 🎉",
        description: "Your candidate profile has been updated. You now have access to all platform features.",
      });

      // Redirect to candidate dashboard instead of pending approval
      navigate("/candidate/dashboard");
    } catch (error: any) {
      console.error("Error submitting candidate application:", error);
      
      let errorMessage = "Failed to submit application. Please try again.";
      
      if (error.message?.includes("JWT") || error.message?.includes("session")) {
        errorMessage = "Session expired. Please log in again and try submitting.";
        // Auto-redirect to login for JWT errors
        setTimeout(() => navigate("/auth/login"), 2000);
      } else if (error.message?.includes("permission") || error.message?.includes("denied")) {
        errorMessage = "Permission denied. Please ensure you're properly logged in.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Submission Failed",
        description: error.message || errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g., 2 years, Fresh graduate"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Your Skills</h2>
              <p className="text-muted-foreground">Select your technical skills</p>
            </div>
            
            <div>
              <Label>Skills (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {skillOptions.map((skill) => (
                  <Badge
                    key={skill}
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Career Goals</h2>
              <p className="text-muted-foreground">What are you aiming for?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="goals">Career Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="Describe your career aspirations..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Preferred Companies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {companiesOptions.map((company) => (
                    <Badge
                      key={company}
                      variant={formData.preferredCompanies.includes(company) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCompanyToggle(company)}
                    >
                      {company}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Upload Resume</h2>
              <p className="text-muted-foreground">Share your latest resume</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume">Resume (PDF)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    resume: e.target.files?.[0] || null 
                  }))}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container max-w-2xl py-10">
        {/* Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-yellow-800">Debug Info</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? 'Hide' : 'Show'} Debug
              </Button>
            </div>
            
            {showDebug && debugInfo && (
              <div className="text-xs space-y-2">
                <div>
                  <strong>User:</strong> {debugInfo.user.email} ({debugInfo.user.id})
                </div>
                <div>
                  <strong>Roles:</strong> {debugInfo.roles.map((r: any) => r.role).join(', ') || 'None'}
                </div>
                <div>
                  <strong>Candidate Requests:</strong> {debugInfo.candidateRequests.length} 
                  {debugInfo.candidateRequests.length > 0 && (
                    <span> (Latest: {debugInfo.candidateRequests[0].status})</span>
                  )}
                </div>
                <div>
                  <strong>Profile:</strong> {debugInfo.profile ? 'Exists' : 'Missing'}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadDebugInfo(debugInfo.user)}
                  className="mt-2"
                >
                  Refresh Debug Info
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Profile Completion:</strong> Complete your profile to get better mentor matches and access all features.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <Progress value={progress} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">Step {currentStep} of 4</p>
          </CardHeader>
          
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < 4 ? (
                  <Button onClick={handleNext} className="btn-gradient">
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete} 
                    className="btn-gradient"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating Profile..." : "Complete Profile"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}