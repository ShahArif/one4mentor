import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
  Loader2
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

  // Check authentication and user role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to search for mentors.",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }

      // Check if user has candidate role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const userRoles = roles?.map(r => r.role) || [];
      setUserRole(userRoles[0] || null);
      
      if (!userRoles.includes("candidate") && !userRoles.includes("admin") && !userRoles.includes("super_admin")) {
        toast({
          title: "Access Restricted",
          description: "This feature is available for candidates. Please complete your candidate onboarding.",
          variant: "destructive",
        });
        navigate("/onboarding/candidate");
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [navigate, toast]);

  // Fetch mentors from Supabase
  const mentorsQuery = useQuery({
    queryKey: ["mentors"],
    queryFn: async (): Promise<MentorProfile[]> => {
      // First get all users with mentor role
      const { data: mentorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "mentor");

      if (rolesError) throw rolesError;

      if (!mentorRoles || mentorRoles.length === 0) {
        return [];
      }

      const mentorIds = mentorRoles.map(r => r.user_id);

      // Get profiles for these mentors
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", mentorIds);

      if (profilesError) throw profilesError;

      // Get mentor onboarding data for approved mentors
      const { data: mentorData, error: mentorDataError } = await supabase
        .from("mentor_onboarding_requests")
        .select("user_id, data")
        .eq("status", "approved")
        .in("user_id", mentorIds);

      if (mentorDataError) throw mentorDataError;

      // Combine profile and mentor data
      const mentorDataMap = new Map(mentorData?.map(m => [m.user_id, m.data]) || []);

      return profiles?.map(profile => ({
        ...profile,
        mentor_data: mentorDataMap.get(profile.id) || {}
      })) || [];
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
                  <p className="text-muted-foreground">
                    {mentorsQuery.data?.length === 0 
                      ? "No approved mentors are available yet. Check back later!"
                      : "Try adjusting your search criteria or filters."}
                  </p>
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
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleBookmark(mentor.id)}
                            >
                              <Heart 
                                className={`h-4 w-4 ${
                                  isBookmarked ? 'fill-red-500 text-red-500' : ''
                                }`} 
                              />
                            </Button>
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
      </div>
    </div>
  );
}