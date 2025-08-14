import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Search,
  Filter,
  User,
  Building,
  Target,
  Calendar
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface MentorshipRequest {
  id: string;
  mentor_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  mentor: {
    fullName: string;
    currentRole?: string;
    company?: string;
    expertise?: string;
    bio?: string;
    skills?: string[];
  };
}

export default function CandidateRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth/login");
        return;
      }

      console.log("🔍 Fetching mentorship requests for candidate:", user.id);

      // Fetch mentorship requests
      const { data: requests, error: requestsError } = await supabase
        .from("mentorship_requests")
        .select("*")
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching requests:", requestsError);
        toast({
          title: "Error",
          description: "Failed to load mentorship requests.",
          variant: "destructive",
        });
        return;
      }

      console.log("📊 Raw mentorship requests:", requests);

      // Fetch mentor details for each request separately
      const requestsWithMentorDetails = await Promise.all(
        (requests || []).map(async (req) => {
          try {
            const { data: mentorData, error: mentorError } = await supabase
              .from("mentor_onboarding_requests")
              .select("data")
              .eq("user_id", req.mentor_id)
              .eq("status", "approved")
              .single();

            if (mentorError) {
              console.error("Error fetching mentor data:", mentorError);
            }

            return {
              id: req.id,
              mentor_id: req.mentor_id,
              message: req.message,
              status: req.status,
              created_at: req.created_at,
              mentor: {
                fullName: mentorData?.data?.fullName || "Unknown Mentor",
                currentRole: mentorData?.data?.currentRole,
                company: mentorData?.data?.company,
                expertise: mentorData?.data?.expertise,
                bio: mentorData?.data?.bio,
                skills: mentorData?.data?.skills
              }
            };
          } catch (error) {
            console.error(`Error fetching mentor details for request ${req.id}:`, error);
            return {
              id: req.id,
              mentor_id: req.mentor_id,
              message: req.message,
              status: req.status,
              created_at: req.created_at,
              mentor: {
                fullName: "Unknown Mentor",
                currentRole: "Unknown",
                company: "Unknown",
                expertise: "Unknown",
                bio: "No bio available",
                skills: []
              }
            };
          }
        })
      );

      console.log("✅ Final processed requests:", requestsWithMentorDetails);
      setRequests(requestsWithMentorDetails);
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
        req.mentor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.mentor.expertise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusCount = (status: string) => {
    return requests.filter(req => req.status === status).length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">❌ Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">🚫 Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your mentorship requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/candidate/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Mentorship Requests</h1>
              <p className="text-gray-600 mt-2">
                Track all your mentorship requests and their current status
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
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
              placeholder="Search mentors by name, company, or expertise..."
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
                  ? "You haven't sent any mentorship requests yet. Start by finding mentors and sending requests!"
                  : "Try adjusting your search criteria or status filter."
                }
              </p>
              {requests.length === 0 && (
                <Button asChild className="mt-4">
                  <Link to="/mentors">Find Mentors</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Request Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {request.mentor.fullName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {request.mentor.currentRole && (
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {request.mentor.currentRole}
                            </span>
                          )}
                          {request.mentor.company && (
                            <span className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {request.mentor.company}
                            </span>
                          )}
                          {request.mentor.expertise && (
                            <span className="flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              {request.mentor.expertise}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.status)}
                      <p className="text-xs text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(request.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Request Message */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">Your Request Message:</h4>
                    <p className="text-blue-700">{request.message || "No message provided"}</p>
                  </div>

                  {/* Mentor Details */}
                  {request.mentor.bio && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">About the Mentor:</h4>
                      <p className="text-gray-700 text-sm">{request.mentor.bio}</p>
                    </div>
                  )}

                  {request.mentor.skills && request.mentor.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Mentor Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {request.mentor.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Information */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className="text-sm text-gray-600">
                          {request.status === "pending" && "Waiting for mentor response"}
                          {request.status === "accepted" && "Request accepted! Mentor will contact you soon"}
                          {request.status === "rejected" && "Request was declined by the mentor"}
                          {request.status === "cancelled" && "Request was cancelled"}
                        </span>
                      </div>
                      
                      {request.status === "accepted" && (
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Mentor
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
