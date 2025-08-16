import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Filter,
  Search,
  Bug,
  ArrowLeft,
  Home,
  Briefcase,
  Users,
  Settings,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CandidateProfileView from "@/components/mentor/CandidateProfileView";
import RoadmapDisplay from "@/components/mentor/RoadmapDisplay";
import { debugMentorshipRequests, checkMentorshipRequestSchema, listAllMentorshipRequests } from "@/utils/debugMentorship";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface MentorshipRequest {
  id: string;
  candidate_id: string;
  mentor_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  selected_skills?: string[];
  candidate: {
    id: string;
    email: string;
    display_name: string;
    candidate_data?: {
      fullName?: string;
      currentRole?: string;
      company?: string;
      experience?: string;
      skills?: string[];
      goals?: string[];
      bio?: string;
      education?: string;
      location?: string;
      linkedinProfile?: string;
      githubProfile?: string;
      portfolioUrl?: string;
    };
  };
  mentor_profile: {
    id: string;
    email: string;
    display_name: string;
  };
}

export default function MentorshipRequests() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      console.log("Fetching all mentorship requests in the system...");

      // Fetch ALL mentorship requests in the system (not just for current mentor)
      const { data: requests, error: requestsError } = await supabase
        .from("mentorship_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching mentorship requests:", requestsError);
        throw requestsError;
      }

      console.log("Raw mentorship requests:", requests);

      // Debug: Check if selected_skills exists in the raw data
      requests?.forEach((req, index) => {
        console.log(`Request ${index}:`, {
          id: req.id,
          selected_skills: req.selected_skills,
          hasSelectedSkills: 'selected_skills' in req
        });
      });

      // Then, fetch candidate profiles and onboarding data for each request
      const requestsWithDetails = await Promise.all(
        (requests || []).map(async (request) => {
          try {
            console.log("Processing request:", request.id, "from candidate:", request.candidate_id, "to mentor:", request.mentor_id);
            
            // Fetch candidate profile
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("email, display_name")
              .eq("id", request.candidate_id)
              .single();

            if (profileError) {
              console.error("Error fetching profile for candidate:", request.candidate_id, profileError);
            }

            // Fetch candidate onboarding data
            const { data: candidateData, error: candidateError } = await supabase
              .from("candidate_onboarding_requests")
              .select("data")
              .eq("user_id", request.candidate_id)
              .eq("status", "approved")
              .single();

            if (candidateError) {
              console.error("Error fetching onboarding data for candidate:", request.candidate_id, candidateError);
            }

            // Fetch mentor profile for the request
            const { data: mentorProfile, error: mentorError } = await supabase
              .from("profiles")
              .select("email, display_name")
              .eq("id", request.mentor_id)
              .single();

            if (mentorError) {
              console.error("Error fetching mentor profile:", request.mentor_id, mentorError);
            }

            const enrichedRequest = {
              ...request,
              candidate: {
                id: request.candidate_id,
                email: profileData?.email || "Unknown Email",
                display_name: profileData?.display_name || "Unknown Candidate",
                candidate_data: candidateData?.data || {}
              },
              mentor_profile: {
                id: request.mentor_id,
                email: mentorProfile?.email || "Unknown Email",
                display_name: mentorProfile?.display_name || "Unknown Mentor"
              }
            };

            console.log("Enriched request:", enrichedRequest);
            return enrichedRequest;
          } catch (error) {
            console.error(`Error fetching details for request ${request.id}:`, error);
            // Return request with minimal data if there's an error
            return {
              ...request,
              candidate: {
                id: request.candidate_id,
                email: "Error loading email",
                display_name: "Error loading name",
                candidate_data: {}
              },
              mentor_profile: {
                id: request.mentor_id,
                email: "Error loading email",
                display_name: "Error loading name"
              }
            };
          }
        })
      );

      console.log("Final enriched requests:", requestsWithDetails);
      setRequests(requestsWithDetails);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load mentorship requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.candidate?.candidate_data?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.candidate?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleRequestAction = async (requestId: string, action: "accept" | "reject") => {
    try {
      const { error } = await supabase
        .from("mentorship_requests")
        .update({ status: action === "accept" ? "accepted" : "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action === "accept" ? "accepted" : "rejected" }
            : req
        )
      );

      toast({
        title: `Request ${action === "accept" ? "Accepted" : "Rejected"}!`,
        description: `You have ${action === "accept" ? "accepted" : "rejected"} the mentorship request.`,
      });

    } catch (error: any) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} the request.`,
        variant: "destructive",
      });
    }
  };

  const handleDebug = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "No authenticated user found",
          variant: "destructive",
        });
        return;
      }

      console.log("🔧 Starting debug process...");
      
      // Debug mentorship requests
      await debugMentorshipRequests(user.id);
      
      // Check schema
      await checkMentorshipRequestSchema();
      
      // List all requests
      await listAllMentorshipRequests();
      
      toast({
        title: "Debug Complete",
        description: "Check console for detailed information",
      });
    } catch (error) {
      console.error("Debug error:", error);
      toast({
        title: "Debug Error",
        description: "Check console for error details",
        variant: "destructive",
      });
    }
  };

  const getStatusCount = (status: string) => {
    return requests.filter(req => req.status === status).length;
  };

  const getTotalCount = () => requests.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mentorship requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/mentor/dashboard">
                <Briefcase className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/mentors">
                <Users className="h-4 w-4 mr-2" />
                Find Mentors
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/profile/edit">
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Mentorship Requests</h1>
          <p className="text-gray-600 mt-2">
            View all mentorship requests in the system from different candidates and mentors
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{getTotalCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{getStatusCount("pending")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold">{getStatusCount("accepted")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold">{getStatusCount("rejected")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search candidates by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDebug}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Bug className="h-4 w-4 mr-1" />
              Debug
            </Button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {requests.length === 0 ? "No Requests Yet" : "No Matching Requests"}
              </h3>
              <p className="text-gray-600">
                {requests.length === 0 
                  ? "There are no mentorship requests in the system yet. Candidates will be able to send requests once they view mentor profiles."
                  : "Try adjusting your search criteria or status filter."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="space-y-4">
                {/* Show mentor information */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Request sent to:</strong> {request.mentor_profile?.display_name || "Unknown Mentor"} ({request.mentor_profile?.email})
                  </p>
                </div>
                
                {/* Tabs for Profile and Roadmaps */}
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Candidate Profile
                    </TabsTrigger>
                    <TabsTrigger value="roadmaps" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Learning Roadmaps
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="mt-4">
                    <CandidateProfileView
                      candidate={request.candidate}
                      requestMessage={request.message}
                      requestDate={request.created_at}
                      selectedSkills={request.selected_skills}
                      onAccept={request.status === "pending" ? () => handleRequestAction(request.id, "accept") : undefined}
                      onReject={request.status === "pending" ? () => handleRequestAction(request.id, "reject") : undefined}
                      onCreateRoadmap={request.status === "accepted" ? () => {
                        // Switch to roadmaps tab when Create Roadmap is clicked
                        const tabsList = document.querySelector('[data-value="roadmaps"]') as HTMLElement;
                        if (tabsList) {
                          tabsList.click();
                        }
                      } : undefined}
                      requestStatus={request.status}
                      initialExpanded={false}
                    />
                  </TabsContent>
                  
                  <TabsContent value="roadmaps" className="mt-4">
                    {request.status === "accepted" ? (
                      <RoadmapDisplay
                        mentorshipRequestId={request.id}
                        candidateId={request.candidate_id}
                        selectedSkills={request.selected_skills || []}
                      />
                    ) : (
                      <Card className="w-full">
                        <CardContent className="p-8">
                          <div className="text-center">
                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Roadmaps Available After Acceptance
                            </h3>
                            <p className="text-gray-600 mb-4">
                              You can create learning roadmaps for this candidate once you accept their mentorship request.
                            </p>
                            {request.status === "pending" && (
                              <Button 
                                onClick={() => handleRequestAction(request.id, "accept")}
                                className="btn-gradient"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Request to Create Roadmap
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ))}
          </div>
        )}
        
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
                <Link to="/mentor/dashboard">
                  <Briefcase className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-10 h-10 p-0"
                title="Find Mentors"
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
