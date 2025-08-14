import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, DollarSign, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const skillOptions = [
  "JavaScript", "Python", "React", "Node.js", "Java", "Data Science",
  "Machine Learning", "UI/UX Design", "Product Management", "DevOps"
];

const availabilityOptions = [
  "Weekdays Morning", "Weekdays Evening", "Weekends", "Flexible"
];

export default function MentorOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    currentRole: "",
    company: "",
    experience: "",
    skills: [] as string[],
    hourlyRate: "",
    availability: [] as string[],
    linkedinProfile: "",
    introduction: ""
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
            description: "Please log in to access mentor onboarding.",
            variant: "destructive",
          });
          navigate("/auth/login");
          return;
        }
        
        console.log("✅ User authenticated for onboarding:", user.email);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
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

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAvailabilityToggle = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter(s => s !== slot)
        : [...prev.availability, slot]
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
      console.log("🔍 Mentor onboarding: Starting submission...");
      
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
      
      // Enhanced authentication check with better debugging
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      console.log("Auth data:", { authData, authError });
      
      if (authError) {
        console.error("Authentication error details:", authError);
        toast({
          title: "Authentication Error",
          description: `Session error: ${authError.message}. Please try logging in again.`,
          variant: "destructive",
        });
        // Redirect to login instead of just returning
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

      // Validate form data before submission
      const requiredFields = ['fullName', 'currentRole', 'experience'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      console.log("📝 Submitting mentor application...", {
        user_id: user.id,
        formData: formData
      });

      // Check if there's an existing mentor request
      const { data: existingRequest, error: checkError } = await supabase
        .from("mentor_onboarding_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Check error:", checkError);
        throw checkError;
      }

      if (existingRequest) {
        // Update existing record with complete profile data
        console.log("📝 Updating existing mentor profile...");
        const { error: updateError } = await supabase
          .from("mentor_onboarding_requests")
          .update({
            data: formData,
            status: "approved" // Changed from "complete" to "approved" - valid enum value
          })
          .eq("id", existingRequest.id);

        if (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }
        
        console.log("✅ Mentor profile updated successfully");
      } else {
        // Create new complete mentor record (fallback)
        console.log("📝 Creating new mentor profile...");
        const { error: insertError } = await supabase
          .from("mentor_onboarding_requests")
          .insert({
            user_id: user.id,
            data: formData,
            status: "approved" // Changed from "complete" to "approved" - valid enum value
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }

        console.log("✅ New mentor profile created successfully");
      }

      toast({
        title: "Profile Completed Successfully! 🎉",
        description: "Your mentor profile has been completed. You now have access to all platform features.",
      });

      // Redirect to mentor dashboard since profile is complete
      navigate("/mentor/dashboard");
    } catch (error: any) {
      console.error("Error submitting mentor application:", error);
      
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
              <h2 className="text-2xl font-bold">Professional Information</h2>
              <p className="text-muted-foreground">Tell us about your background</p>
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
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  value={formData.currentRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Current company"
                />
              </div>
              
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10-15">10-15 years</SelectItem>
                    <SelectItem value="15+">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Expertise & Bio</h2>
              <p className="text-muted-foreground">Showcase your skills</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe your professional background and expertise..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Areas of Expertise</Label>
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
              
              <div>
                <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                <Input
                  id="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Pricing & Availability</h2>
              <p className="text-muted-foreground">Set your mentoring preferences</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="e.g., 1500"
                />
              </div>
              
              <div>
                <Label>Availability</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availabilityOptions.map((slot) => (
                    <Badge
                      key={slot}
                      variant={formData.availability.includes(slot) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAvailabilityToggle(slot)}
                    >
                      {slot}
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
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Final Details</h2>
              <p className="text-muted-foreground">Complete your mentor profile</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="introduction">Introduction Message</Label>
                <Textarea
                  id="introduction"
                  value={formData.introduction}
                  onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
                  placeholder="Write a message that candidates will see when they view your profile..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container max-w-2xl py-10">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Mentor Onboarding
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
                    {isSubmitting ? "Submitting..." : "Complete Application"}
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