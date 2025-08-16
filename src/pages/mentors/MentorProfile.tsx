import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Star, MessageCircle, BookOpen, DollarSign, Users, Award, ArrowLeft, Briefcase, Home, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface MentorProfile {
  id: string;
  fullName: string;
  expertise: string;
  experience: string;
  bio: string;
  hourlyRate: string;
  availability: string[];
  skills: string[];
  linkedinProfile?: string;
  introduction?: string;
  company?: string;
  currentRole?: string;
}

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          
          // Check user role
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          
          if (roles && roles.length > 0) {
            setUserRole(roles[0].role);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        
        // Fetch mentor profile from onboarding requests
        const { data: mentorData, error } = await supabase
          .from("mentor_onboarding_requests")
          .select("user_id, data")
          .eq("user_id", id)
          .eq("status", "approved")
          .single();

        if (error) {
          console.error("Error fetching mentor:", error);
          toast({
            title: "Error",
            description: "Failed to load mentor profile.",
            variant: "destructive",
          });
          return;
        }

        if (mentorData) {
          setMentor({
            id: mentorData.user_id,
            ...mentorData.data
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorProfile();
  }, [id, toast]);

  const handleRequestMentorship = async () => {
    if (!isAuthenticated || !userRole || !mentor) return;

    if (userRole !== "candidate") {
      toast({
        title: "Access Denied",
        description: "Only candidates can request mentorship.",
        variant: "destructive",
      });
      return;
    }

    if (!requestMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message explaining why you'd like mentorship.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSkills.length === 0) {
      toast({
        title: "Skills Required",
        description: "Please select at least one skill you'd like to learn from this mentor.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from("mentorship_requests")
        .select("id")
        .eq("candidate_id", user.id)
        .eq("mentor_id", mentor.id)
        .maybeSingle();

      if (existingRequest) {
        toast({
          title: "Request Already Sent",
          description: "You have already sent a mentorship request to this mentor.",
          variant: "destructive",
        });
        return;
      }

      // Create mentorship request with selected skills
      const { error } = await supabase
        .from("mentorship_requests")
        .insert({
          candidate_id: user.id,
          mentor_id: mentor.id,
          message: requestMessage.trim(),
          status: "pending",
          selected_skills: selectedSkills // Add selected skills to the request
        });

      if (error) throw error;

      toast({
        title: "Request Sent! 🎉",
        description: "Your mentorship request has been sent to the mentor.",
      });

      setShowRequestModal(false);
      setRequestMessage("");
      setSelectedSkills([]);
      
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send mentorship request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Mentor Not Found</h2>
          <p className="mt-2 text-gray-600">The mentor profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/mentors")} className="mt-4">
            Back to Mentors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Navigation Bar */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/mentors">
                <Users className="h-4 w-4 mr-2" />
                Find Mentors
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/candidate/dashboard">
                <Briefcase className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
          
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/mentors")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentors
          </Button>
        </div>

        {/* Mentor Profile Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-4 border-white">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${mentor.fullName}`} />
                  <AvatarFallback className="text-2xl font-bold bg-white text-blue-600">
                    {mentor.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl">{mentor.fullName}</CardTitle>
                  <p className="text-blue-100 text-lg">{mentor.currentRole || mentor.expertise}</p>
                  {mentor.company && (
                    <p className="text-blue-100">{mentor.company}</p>
                  )}
                </div>
              </div>
              
              {/* Request Mentorship Button */}
              {isAuthenticated && userRole === "candidate" && (
                <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Request Mentorship
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Mentorship from {mentor.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Skills Selection */}
                      <div>
                        <Label>Select skills you'd like to learn (required)</Label>
                        <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600 mb-2">
                            Click on skills to select/deselect them:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {mentor.skills?.map((skill, index) => (
                              <Badge
                                key={index}
                                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${
                                  selectedSkills.includes(skill) 
                                    ? "bg-blue-600 hover:bg-blue-700" 
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() => toggleSkill(skill)}
                              >
                                {skill}
                                {selectedSkills.includes(skill) && (
                                  <span className="ml-1">✓</span>
                                )}
                              </Badge>
                            ))}
                          </div>
                          {selectedSkills.length === 0 && (
                            <p className="text-sm text-red-500 mt-2">
                              Please select at least one skill
                            </p>
                          )}
                          {selectedSkills.length > 0 && (
                            <p className="text-sm text-green-600 mt-2">
                              Selected: {selectedSkills.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Why would you like mentorship?</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell the mentor about your goals, what you're looking to learn, and why you think they'd be a great fit..."
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowRequestModal(false);
                            setRequestMessage("");
                            setSelectedSkills([]);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleRequestMentorship}
                          disabled={isSubmitting || !requestMessage.trim() || selectedSkills.length === 0}
                        >
                          {isSubmitting ? "Sending..." : "Send Request"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Bio Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">About</h3>
              <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mentor.experience}</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">₹{mentor.hourlyRate}</div>
                <div className="text-gray-600">Per Hour</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{mentor.skills?.length || 0}</div>
                <div className="text-gray-600">Skills</div>
              </div>
            </div>

            {/* Skills */}
            {mentor.skills && mentor.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant={selectedSkills.includes(skill) ? "default" : "secondary"} 
                      className={`text-sm ${
                        showRequestModal && selectedSkills.includes(skill) 
                          ? "ring-2 ring-blue-400 ring-offset-2" 
                          : ""
                      }`}
                    >
                      {skill}
                      {showRequestModal && selectedSkills.includes(skill) && (
                        <span className="ml-1">✓</span>
                      )}
                    </Badge>
                  ))}
                </div>
                {showRequestModal && selectedSkills.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    Selected skills: {selectedSkills.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Availability */}
            {mentor.availability && mentor.availability.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.availability.map((slot, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      <Clock className="mr-1 h-3 w-3" />
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Introduction Message */}
            {mentor.introduction && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Message to Candidates</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 italic">"{mentor.introduction}"</p>
                </div>
              </div>
            )}

            {/* Contact & Links */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-3">Contact & Links</h3>
              <div className="flex flex-wrap gap-4">
                {mentor.linkedinProfile && (
                  <Button variant="outline" asChild>
                    <a href={mentor.linkedinProfile} target="_blank" rel="noopener noreferrer">
                      <Users className="mr-2 h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate("/mentors")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  View All Mentors
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Floating Navigation Menu */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-lg shadow-lg border p-2">
            <div className="flex flex-col gap-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-10 h-10 p-0"
                title="Go Home"
              >
                <Link to="/">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-10 h-10 p-0"
                title="Find More Mentors"
              >
                <Link to="/mentors">
                  <Users className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-10 h-10 p-0"
                title="Go to Dashboard"
              >
                <Link to="/candidate/dashboard">
                  <Briefcase className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-10 h-10 p-0"
                title="My Profile"
              >
                <Link to="/profile/edit">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Back to Top Button */}
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-50 w-10 h-10 p-0 rounded-full shadow-lg"
          variant="outline"
          title="Back to Top"
        >
          <ArrowLeft className="h-4 w-4 rotate-90" />
        </Button>
      </div>
    </div>
  );
}
