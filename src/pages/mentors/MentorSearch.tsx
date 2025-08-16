import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { setupTestMentors, checkDatabaseState } from "@/utils/setupTestMentors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock,
  Heart,
  MessageCircle,
  Briefcase,
  ArrowLeft,
  Users,
  Loader2,
  Database,
  UserPlus,
  Home,
  User
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const skillFilters = [
  "JavaScript", "Python", "React", "Node.js", "Java", "Data Science",
  "Machine Learning", "UI/UX Design", "Product Management", "DevOps"
];

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
  };
}

export default function MentorSearch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [bookmarkedMentors, setBookmarkedMentors] = useState<Set<string>>(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Check authentication and user role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Allow unauthenticated users to browse mentors
        console.log("Unauthenticated user - allowing mentor browsing");
        setIsAuthenticated(true);
        setUserRole(null);
        return;
      }

      // Check if user has candidate role or admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const userRoles = roles?.map(r => r.role) || [];
      setUserRole(userRoles[0] || null);
      
      console.log("User roles:", userRoles); // Debug log
      
      // Allow all authenticated users to browse mentors
      // But restrict booking features to approved candidates
      setIsAuthenticated(true);
      
      // Optional: Show a message for users without candidate role
      if (userRoles.length === 0) {
        // Check if user has a pending application
        const { data: candidateRequest } = await supabase
          .from("candidate_onboarding_requests")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (candidateRequest?.status === "pending") {
          toast({
            title: "Application Under Review",
            description: "You can browse mentors, but booking features will be available once your application is approved.",
          });
        } else if (candidateRequest?.status === "rejected") {
          toast({
            title: "Limited Access",
            description: "You can browse mentors, but need approval to book sessions.",
          });
        } else if (!candidateRequest) {
          toast({
            title: "Browse Mentors",
            description: "Complete your candidate application to unlock booking features.",
          });
        }
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch mentors from Supabase
  const mentorsQuery = useQuery({
    queryKey: ["mentors"],
    queryFn: async (): Promise<MentorProfile[]> => {
      console.log("Fetching mentors..."); // Debug log
      
      // First get all users with mentor role
      const { data: mentorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "mentor");

      console.log("Mentor roles data:", mentorRoles, "Error:", rolesError); // Debug log

      if (rolesError) throw rolesError;

      if (!mentorRoles || mentorRoles.length === 0) {
        console.log("No mentors found in user_roles table"); // Debug log
        return [];
      }

      const mentorIds = mentorRoles.map(r => r.user_id);
      console.log("Mentor IDs:", mentorIds); // Debug log

      // Get profiles for these mentors
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", mentorIds);

      console.log("Profiles data:", profiles, "Error:", profilesError); // Debug log

      if (profilesError) throw profilesError;

      // Get mentor onboarding data for approved mentors
      const { data: mentorData, error: mentorDataError } = await supabase
        .from("mentor_onboarding_requests")
        .select("user_id, data")
        .eq("status", "approved")
        .in("user_id", mentorIds);

      console.log("Mentor onboarding data:", mentorData, "Error:", mentorDataError); // Debug log

      if (mentorDataError) throw mentorDataError;

      // Combine profile and mentor data
      const mentorDataMap = new Map(mentorData?.map(m => [m.user_id, m.data]) || []);

      const result = profiles?.map(profile => ({
        ...profile,
        mentor_data: mentorDataMap.get(profile.id) || {}
      })) || [];

      console.log("Final mentor result:", result); // Debug log
      
      return result;
    },
    enabled: isAuthenticated,
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleBookmark = (mentorId: string) => {
    setBookmarkedMentors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mentorId)) {
        newSet.delete(mentorId);
        toast({ title: "Removed from bookmarks" });
      } else {
        newSet.add(mentorId);
        toast({ title: "Added to bookmarks" });
      }
      return newSet;
    });
  };

  const filteredMentors = mentorsQuery.data?.filter(mentor => {
    const mentorData = mentor.mentor_data || {};
    const searchableText = `${mentor.display_name} ${mentorData.fullName} ${mentorData.currentRole} ${mentorData.company} ${mentorData.bio}`.toLowerCase();
    
    // Search term filter
    if (searchTerm && !searchableText.includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Skills filter
    if (selectedSkills.length > 0) {
      const mentorSkills = mentorData.skills || [];
      if (!selectedSkills.some(skill => mentorSkills.includes(skill))) {
        return false;
      }
    }
    
    // Experience filter
    if (experienceFilter !== "all") {
      const experience = parseInt(mentorData.experience || "0");
      switch (experienceFilter) {
        case "entry": return experience < 3;
        case "mid": return experience >= 3 && experience <= 7;
        case "senior": return experience > 7;
        default: return true;
      }
    }

    return true;
  }) || [];

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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Quick Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Users className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/candidate/dashboard">
                <Briefcase className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/candidate/requests">
                <MessageCircle className="h-4 w-4 mr-2" />
                My Requests
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Find Your Perfect Mentor</h1>
              <p className="text-muted-foreground">
                Connect with industry experts to accelerate your career
              </p>
            </div>
          </div>


          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name, company, or skills..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Skills Filter */}
                  <div>
                    <h3 className="font-medium mb-3">Skills</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {skillFilters.map(skill => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={selectedSkills.includes(skill)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <label htmlFor={skill} className="text-sm">{skill}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <h3 className="font-medium mb-3">Experience Level</h3>
                    <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="entry">Entry (0-3 years)</SelectItem>
                        <SelectItem value="mid">Mid (3-7 years)</SelectItem>
                        <SelectItem value="senior">Senior (7+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <h3 className="font-medium mb-3">Availability</h3>
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            {/* Debug Data Display */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-sm">Debug Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs space-y-2">
                    <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>User Role:</strong> {userRole || 'None'}</p>
                    <p><strong>Query Status:</strong> {mentorsQuery.isLoading ? 'Loading...' : mentorsQuery.error ? 'Error' : 'Success'}</p>
                    <p><strong>Raw Data Count:</strong> {mentorsQuery.data?.length || 0}</p>
                    <p><strong>Filtered Count:</strong> {filteredMentors.length}</p>
                    {mentorsQuery.error && (
                      <p className="text-red-600"><strong>Error:</strong> {mentorsQuery.error.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {mentorsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading mentors...</span>
                </div>
              </div>
            ) : filteredMentors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                  <p className="text-muted-foreground mb-4">
                    {mentorsQuery.data?.length === 0 
                      ? "No approved mentors are available yet. Mentors must complete their onboarding and be approved by our admin team before appearing in search results."
                      : "Try adjusting your search criteria or filters."}
                  </p>
                  {mentorsQuery.data?.length === 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        🔍 Looking to become a mentor? <br />
                        Complete the mentor onboarding process and wait for admin approval.
                      </p>
                      <Button variant="outline" asChild>
                        <Link to="/onboarding/mentor">Apply as Mentor</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => {
                  const mentorData = mentor.mentor_data || {};
                  const isBookmarked = bookmarkedMentors.has(mentor.id);
                  
                  return (
                    <Card key={mentor.id} className="card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://avatar.vercel.sh/${mentor.email}`} />
                            <AvatarFallback>
                              {(mentorData.fullName || mentor.display_name || mentor.email)
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                              {mentorData.fullName || mentor.display_name || 'Anonymous Mentor'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {mentorData.currentRole || 'Professional Mentor'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {mentorData.company || 'Industry Expert'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4 mr-2" />
                            {mentorData.experience || '0'}+ years experience
                          </div>
                          
                          {mentorData.hourlyRate && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">₹{mentorData.hourlyRate}/hour</span>
                            </div>
                          )}

                          {mentorData.skills && mentorData.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {mentorData.skills.slice(0, 3).map((skill: string) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {mentorData.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{mentorData.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-2 pt-2">
                            <Link to={`/mentor/${mentor.id}`} className="flex-1">
                              <Button className="w-full btn-gradient">
                                View Profile
                              </Button>
                            </Link>
                            
                            {/* Show bookmark button only for authenticated users */}
                            {userRole && (
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleBookmark(mentor.id)}
                                title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                              >
                                <Heart 
                                  className={`h-4 w-4 ${
                                    isBookmarked ? 'fill-red-500 text-red-500' : ''
                                  }`} 
                                />
                              </Button>
                            )}
                            
                            {/* Show login prompt for unauthenticated users */}
                            {!userRole && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate("/auth/login")}
                              >
                                Login to Book
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
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
                title="My Requests"
              >
                <Link to="/candidate/requests">
                  <MessageCircle className="h-4 w-4" />
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
        {showBackToTop && (
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-50 w-10 h-10 p-0 rounded-full shadow-lg transition-all duration-300"
            variant="outline"
            title="Back to Top"
          >
            <ArrowLeft className="h-4 w-4 rotate-90" />
          </Button>
        )}
      </div>
    </div>
  );
}