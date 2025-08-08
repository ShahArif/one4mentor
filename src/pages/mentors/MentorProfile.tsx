import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  ArrowLeft,
  MessageCircle,
  Heart,
  ExternalLink,
  Loader2
} from "lucide-react";

interface MentorProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  mentor_data?: {
    fullName?: string;
    currentRole?: string;
    company?: string;
    bio?: string;
    skills?: string[];
    hourlyRate?: string;
    availability?: string[];
    linkedinProfile?: string;
    experience?: string;
    introduction?: string;
    rating?: string;
    reviewCount?: string;
    location?: string;
  };
}

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState<"30min" | "60min" | "90min">("60min");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view mentor profiles.",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [navigate, toast]);

  const mentorQuery = useQuery({
    queryKey: ["mentor", id],
    queryFn: async (): Promise<MentorProfile | null> => {
      if (!id) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (profileError) throw profileError;

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", id)
        .eq("role", "mentor")
        .single();
      if (roleError && roleError.code !== 'PGRST116') throw roleError;
      if (!roleData) throw new Error("User is not a mentor");

      const { data: mentorData, error: mentorDataError } = await supabase
        .from("mentor_onboarding_requests")
        .select("data")
        .eq("user_id", id)
        .eq("status", "approved")
        .single();
      if (mentorDataError && mentorDataError.code !== 'PGRST116') {
        console.warn("Mentor data not found, using profile only");
      }

      return {
        ...profile,
        mentor_data: mentorData?.data || {}
      };
    },
    enabled: isAuthenticated && !!id,
  });

  const handleBookSession = () => {
    if (!id) return;
    navigate(`/booking/${id}?duration=${selectedDuration}`);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ 
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks" 
    });
  };

  const handleMessage = () => {
    navigate(`/chat?mentor=${id}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (mentorQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading mentor profile...</span>
        </div>
      </div>
    );
  }

  if (mentorQuery.error || !mentorQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Mentor Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This mentor profile doesn't exist or hasn't been approved yet.
            </p>
            <Button onClick={() => navigate("/mentors")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mentor = mentorQuery.data;
  const mentorData = mentor.mentor_data || {};
  const hourlyRate = parseInt(mentorData.hourlyRate || "0");
  const pricing = {
    "30min": Math.round(hourlyRate * 0.5),
    "60min": hourlyRate,
    "90min": Math.round(hourlyRate * 1.5)
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/mentors")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`https://avatar.vercel.sh/${mentor.email}`} />
                    <AvatarFallback className="text-lg">
                      {(mentorData.fullName || mentor.display_name || mentor.email)
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">
                      {mentorData.fullName || mentor.display_name || 'Anonymous Mentor'}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-4">
                      {mentorData.currentRole || 'Professional Mentor'}
                      {mentorData.company && ` at ${mentorData.company}`}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="font-semibold">{mentorData.rating || "4.8"}</span>
                        <span className="text-muted-foreground">
                          ({mentorData.reviewCount || "42"} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{mentorData.experience || '0'}+ years experience</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>25+ mentees</span>
                      </div>
                      {mentorData.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{mentorData.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={handleMessage} variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button onClick={handleBookmark} variant="outline" size="icon">
                        <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      {mentorData.linkedinProfile && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={mentorData.linkedinProfile} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {mentorData.bio || mentorData.introduction || 
                       "This mentor hasn't provided a detailed bio yet, but they're ready to help you grow in your career!"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Experience Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-primary mr-3" />
                        <span>{mentorData.experience || '0'}+ years of industry experience</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-primary mr-3" />
                        <span>Mentored 25+ professionals</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-primary mr-3" />
                        <span>Completed 100+ mentoring sessions</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mentorData.skills && mentorData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {mentorData.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Skills information not available yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Time Slots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mentorData.availability && mentorData.availability.length > 0 ? (
                      <div className="space-y-2">
                        {mentorData.availability.map((slot: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <span>{slot}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Availability information not provided. Contact the mentor to schedule a session.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
                <CardDescription>
                  Choose session duration and start your mentoring journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <div className="space-y-2">
                    {Object.entries(pricing).map(([duration, price]) => (
                      <div 
                        key={duration}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDuration === duration 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedDuration(duration as any)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{duration}</span>
                          <span className="text-lg font-bold">
                            {price > 0 ? `₹${price}` : 'Contact for pricing'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full btn-gradient" 
                  size="lg"
                  onClick={handleBookSession}
                  disabled={!pricing[selectedDuration]}
                >
                  Book {selectedDuration} Session
                </Button>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response time</span>
                    <span className="font-medium">&lt; 2 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessions completed</span>
                    <span className="font-medium">100+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success rate</span>
                    <span className="font-medium">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorProfile;
