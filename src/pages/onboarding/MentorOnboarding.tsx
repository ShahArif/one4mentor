import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, DollarSign, CheckCircle } from "lucide-react";
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
      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to complete onboarding.",
          variant: "destructive",
        });
        return;
      }

      // Save onboarding data to Supabase
      const { error } = await supabase
        .from("mentor_onboarding_requests")
        .insert({
          user_id: user.id,
          data: formData,
          status: "pending"
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Application Submitted",
        description: "Your mentor application has been submitted for review. You'll be notified once it's approved.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting mentor application:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-2xl py-10">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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