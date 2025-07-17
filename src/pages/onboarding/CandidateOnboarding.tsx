import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Target, Upload, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const skillOptions = [
  "JavaScript", "Python", "React", "Node.js", "Java", "Data Science",
  "Machine Learning", "UI/UX Design", "Product Management", "DevOps"
];

const companiesOptions = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", "Airbnb"
];

export default function CandidateOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleComplete = () => {
    // Save onboarding data
    console.log("Onboarding completed:", formData);
    navigate("/candidate/dashboard");
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
              <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
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

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Candidate Onboarding</CardTitle>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep === 4 ? (
              <Button onClick={handleComplete} className="bg-gradient-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-gradient-primary">
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}