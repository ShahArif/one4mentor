import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  Star, 
  Clock,
  Target,
  TrendingUp,
  Users,
  Bell,
  LogOut,
  AlertCircle,
  CheckCircle,
  User,
  Search,
  Loader2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/use-logout";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CandidateLayout } from "@/components/layout/CandidateLayout";

interface MentorshipRequest {
  id: string;
  mentor_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  selected_skills?: string[];
  mentor: {
    fullName: string;
    currentRole?: string;
    company?: string;
    expertise?: string;
  };
}

interface Session {
  id: string;
  mentor_name: string;
  type: string;
  date: string;
  duration: string;
  status: "scheduled" | "completed" | "cancelled";
}

interface Feedback {
  id: string;
  mentor_name: string;
  rating: number;
  feedback: string;
  date: string;
}

interface LearningProgress {
  skill: string;
  progress: number;
}

export default function CandidateDashboard() {
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvalStatus, setApprovalStatus] = useState<{
    isApproved: boolean;
    isLoading: boolean;
    applicationStatus?: string;
    needsProfileCompletion?: boolean;
  }>({ isApproved: false, isLoading: true });

  // Real data states
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    acceptedRequests: 0,
    totalSessions: 0,
    completedSessions: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate("/auth/login");
          return;
        }

        // Check if user has candidate role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const userRoles = roles?.map(r => r.role) || [];

        if (userRoles.includes("candidate")) {
          // Check if profile is complete
          const { data: candidateRequest } = await supabase
            .from("candidate_onboarding_requests")
            .select("status, data")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (candidateRequest) {
            const isProfileComplete = candidateRequest.data && Object.keys(candidateRequest.data).length > 1;
            
            if (candidateRequest.status === "approved" && isProfileComplete) {
              setApprovalStatus({
                isApproved: true,
                isLoading: false,
                applicationStatus: "approved",
                needsProfileCompletion: false
              });
              // Fetch real data once approved
              fetchDashboardData(user.id);
            } else if (candidateRequest.status === "approved" && !isProfileComplete) {
              setApprovalStatus({
                isApproved: false,
                isLoading: false,
                applicationStatus: "incomplete",
                needsProfileCompletion: true
              });
            } else if (candidateRequest.status === "pending") {
              setApprovalStatus({
                isApproved: false,
                isLoading: false,
                applicationStatus: "pending",
                needsProfileCompletion: false
              });
            } else {
              setApprovalStatus({
                isApproved: false,
                isLoading: false,
                applicationStatus: "rejected",
                needsProfileCompletion: false
              });
            }
          } else {
            setApprovalStatus({
              isApproved: false,
              isLoading: false,
              applicationStatus: "not_found",
              needsProfileCompletion: true
            });
          }
        } else {
          setApprovalStatus({
            isApproved: false,
            isLoading: false,
            applicationStatus: "not_candidate",
            needsProfileCompletion: false
          });
        }
      } catch (error) {
        console.error("Error checking approval status:", error);
        setApprovalStatus({
          isApproved: false,
          isLoading: false,
          applicationStatus: "error",
          needsProfileCompletion: false
        });
      }
    };

    checkApprovalStatus();
  }, [navigate, toast]);

  const fetchDashboardData = async (userId: string) => {
    try {
      setIsLoadingData(true);
      
      // Fetch mentorship requests
      const { data: requests, error: requestsError } = await supabase
        .from("mentorship_requests")
        .select("*")
        .eq("candidate_id", userId)
        .order("created_at", { ascending: false });

      console.log("🔍 Raw mentorship requests for candidate:", userId, requests);

      if (requestsError) {
        console.error("Error fetching requests:", requestsError);
        setMentorshipRequests([]);
      } else {
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
                selected_skills: req.selected_skills,
                mentor: {
                  fullName: mentorData?.data?.fullName || "Unknown Mentor",
                  currentRole: mentorData?.data?.currentRole,
                  company: mentorData?.data?.company,
                  expertise: mentorData?.data?.expertise
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
                selected_skills: req.selected_skills,
                mentor: {
                  fullName: "Unknown Mentor",
                  currentRole: "Unknown",
                  company: "Unknown",
                  expertise: "Unknown"
                }
              };
            }
          })
        );
        
        setMentorshipRequests(requestsWithMentorDetails);
        
        console.log("✅ Final processed mentorship requests:", requestsWithMentorDetails);
        
        // Calculate stats based on the fetched requests
        const totalRequests = requestsWithMentorDetails.length;
        const acceptedRequests = requestsWithMentorDetails.filter(r => r.status === "accepted").length;
        
        setStats(prev => ({
          ...prev,
          totalRequests,
          acceptedRequests
        }));
      }

      // TODO: Uncomment when sessions table is created
      // Fetch real sessions data
      // const { data: sessions, error: sessionsError } = await supabase
      //   .from("sessions")
      //   .select("*")
      //   .eq("candidate_id", userId)
      //   .order("scheduled_date", { ascending: true });

      // if (sessionsError) {
      //   console.error("Error fetching sessions:", sessionsError);
      //   setUpcomingSessions([]);
      // } else {
      //   // Fetch mentor details for each session separately
      //   const sessionsWithMentorDetails = await Promise.all(
      //     (sessions || []).map(async (session) => {
      //       try {
      //         const { data: mentorData, error: mentorError } = await supabase
      //           .from("mentor_onboarding_requests")
      //           .select("data")
      //           .eq("user_id", session.mentor_id)
      //           .eq("status", "approved")
      //           .single();

      //         if (mentorError) {
      //         console.error("Error fetching mentor data for session:", mentorError);
      //         }

      //         return {
      //           id: session.id,
      //           mentor_name: mentorData?.data?.fullName || "Unknown Mentor",
      //           type: session.session_type,
      //           date: new Date(session.scheduled_date).toLocaleDateString("en-US", {
      //             weekday: "long",
      //             month: "short",
      //             day: "numeric",
      //             hour: "2-digit",
      //             minute: "2-digit"
      //           }),
      //           duration: `${session.duration_minutes} mins`,
      //           status: session.status
      //         };
      //       } catch (error) {
      //         console.error(`Error fetching mentor details for session ${session.id}:`, error);
      //         return {
      //           id: session.id,
      //           mentor_name: "Unknown Mentor",
      //           type: session.session_type,
      //           date: new Date(session.scheduled_date).toLocaleDateString("en-US", {
      //             weekday: "long",
      //             month: "short",
      //             day: "numeric",
      //             hour: "2-digit",
      //             minute: "2-digit"
      //           }),
      //           duration: `${session.duration_minutes} mins`,
      //           status: session.status
      //         };
      //       }
      //     })
      //   );
        
      //   setUpcomingSessions(sessionsWithMentorDetails);
        
      //   // Update stats with real session data
      //   setStats(prev => ({
      //     ...prev,
      //     totalSessions: sessionsWithMentorDetails.length,
      //     completedSessions: sessionsWithMentorDetails.filter(s => s.status === "completed").length
      //   }));
      // }

      // Temporary: Set empty sessions and update stats
      setUpcomingSessions([]);
      setStats(prev => ({
        ...prev,
        totalSessions: 0,
        completedSessions: 0
      }));

      // TODO: Uncomment when session_feedback table is created
      // Fetch real feedback data
      // const { data: feedback, error: feedbackError } = await supabase
      //   .from("session_feedback")
      //   .select("*")
      //   .eq("candidate_id", userId)
      //   .order("created_at", { ascending: false })
      //   .limit(5);

      // TODO: Uncomment when session_feedback table is created
      // if (feedbackError) {
      //   console.error("Error fetching feedback:", feedbackError);
      //   setRecentFeedback([]);
      // } else {
      //   // Fetch mentor details for each feedback separately
      //   const feedbackWithMentorDetails = await Promise.all(
      //     (feedback || []).map(async (fb) => {
      //       try {
      //         const { data: mentorData, error: mentorError } = await supabase
      //           .from("mentor_onboarding_requests")
      //           .select("data")
      //           .eq("user_id", fb.mentor_id)
      //           .eq("status", "approved")
      //           .single();

      //         if (mentorError) {
      //         console.error("Error fetching mentor data for feedback:", mentorError);
      //         }

      //         return {
      //           id: fb.id,
      //           mentor_name: mentorData?.data?.fullName || "Unknown Mentor",
      //           rating: fb.rating,
      //           feedback: fb.feedback || "No feedback provided",
      //           date: new Date(fb.created_at).toLocaleDateString("en-US", {
      //             month: "short",
      //             day: "numeric"
      //           })
      //         };
      //       } catch (error) {
      //         console.error(`Error fetching mentor details for feedback ${fb.id}:`, error);
      //         return {
      //           id: fb.id,
      //           mentor_name: "Unknown Mentor",
      //           rating: fb.rating,
      //           feedback: fb.feedback || "No feedback provided",
      //           date: new Date(fb.created_at).toLocaleDateString("en-US", {
      //             month: "short",
      //             day: "numeric"
      //           })
      //         };
      //       }
      //     })
      //   );
        
      //   setRecentFeedback(feedbackWithMentorDetails);
      // }

      // Temporary: Set empty feedback
      setRecentFeedback([]);

      // Fetch real learning progress data
      const { data: progress, error: progressError } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userId)
        .order("last_updated", { ascending: false });

      if (progressError) {
        console.error("Error fetching learning progress:", progressError);
        // Set default progress if no data exists
        const defaultProgress: LearningProgress[] = [
          { skill: "JavaScript", progress: 0 },
          { skill: "React", progress: 0 },
          { skill: "System Design", progress: 0 },
          { skill: "Data Structures", progress: 0 }
        ];
        setLearningProgress(defaultProgress);
      } else {
        const formattedProgress: LearningProgress[] = progress?.map(p => ({
          skill: p.skill_name,
          progress: p.progress_percentage
        })) || [];
        
        setLearningProgress(formattedProgress);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  if (approvalStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // If not approved, show pending approval status
  if (!approvalStatus.isApproved) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container max-w-2xl py-16">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-6">
              {approvalStatus.applicationStatus === "pending" ? (
                <Clock className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              ) : approvalStatus.applicationStatus === "rejected" ? (
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              ) : (
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              )}
              
              <CardTitle className="text-2xl mb-2">
                {approvalStatus.applicationStatus === "pending" ? "Application Under Review" :
                 approvalStatus.applicationStatus === "rejected" ? "Application Not Approved" :
                 "Complete Your Application"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {approvalStatus.applicationStatus === "pending" 
                  ? "Your candidate application is being reviewed by our admin team. You'll receive a notification once it's approved."
                  : approvalStatus.applicationStatus === "rejected"
                  ? "Your application was not approved. Please contact support for more information."
                  : "Please complete your candidate onboarding to access the dashboard."}
              </p>
              
              <div className="flex gap-3 justify-center">
                {approvalStatus.applicationStatus === "pending" ? (
                  <Button onClick={() => navigate("/onboarding/pending-approval")}>
                    Check Status
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/onboarding/candidate")}>
                    Complete Onboarding
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate("/")}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <CandidateLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back! Here's what's happening with your mentorship journey.
              </p>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile/edit">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {approvalStatus.needsProfileCompletion && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Add your skills, experience, and goals to get better mentor matches.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate("/onboarding/candidate")}>
                Complete Profile
              </Button>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <Breadcrumbs />
        
                 {/* Main Content */}
         <div className="space-y-8">
           {/* Quick Stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             <Card>
               <CardContent className="p-6">
                 <div className="flex items-center">
                   <MessageCircle className="h-8 w-8 text-blue-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-600">Mentorship Requests</p>
                     <p className="text-2xl font-bold">{mentorshipRequests.length}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card>
               <CardContent className="p-6">
                 <div className="flex items-center">
                   <BookOpen className="h-8 w-8 text-green-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-600">Learning Roadmaps</p>
                     <p className="text-2xl font-bold">0</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card>
               <CardContent className="p-6">
                 <div className="flex items-center">
                   <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                   <div>
                     <p className="text-sm text-gray-600">Pending Requests</p>
                     <p className="text-2xl font-bold">{mentorshipRequests.filter(r => r.status === "pending").length}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

           {/* Important Action Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             <Card className="hover:shadow-lg transition-shadow cursor-pointer">
               <Link to="/candidate/requests" className="block">
                 <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       <Users className="h-8 w-8 text-indigo-500 mr-3" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Active Mentorships</p>
                         <p className="text-2xl font-bold text-indigo-600">
                           {mentorshipRequests.filter(r => r.status === "accepted").length}
                         </p>
                         <p className="text-xs text-gray-500 mt-1">View all requests</p>
                       </div>
                     </div>
                     <div className="text-indigo-500">
                       <ChevronRight className="h-5 w-5" />
                     </div>
                   </div>
                 </CardContent>
               </Link>
             </Card>

             <Card className="hover:shadow-lg transition-shadow cursor-pointer">
               <Link to="/candidate/roadmaps" className="block">
                 <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       <Target className="h-8 w-8 text-emerald-500 mr-3" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Learning Goals</p>
                         <p className="text-2xl font-bold text-emerald-600">3</p>
                         <p className="text-xs text-gray-500 mt-1">Track progress</p>
                       </div>
                     </div>
                     <div className="text-emerald-500">
                       <ChevronRight className="h-5 w-5" />
                     </div>
                   </div>
                 </CardContent>
               </Link>
             </Card>

             <Card className="hover:shadow-lg transition-shadow cursor-pointer">
               <Link to="/sessions" className="block">
                 <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Upcoming Sessions</p>
                         <p className="text-2xl font-bold text-purple-600">
                           {upcomingSessions.length}
                         </p>
                         <p className="text-xs text-gray-500 mt-1">Schedule & manage</p>
                       </div>
                     </div>
                     <div className="text-purple-500">
                       <ChevronRight className="h-5 w-5" />
                     </div>
                   </div>
                 </CardContent>
               </Link>
             </Card>
           </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading sessions...</span>
                  </div>
                ) : upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{session.type}</h4>
                        <p className="text-sm text-muted-foreground">with {session.mentor_name}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.date} • {session.duration}
                        </div>
                      </div>
                      <Badge variant={session.status === "scheduled" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p>No upcoming sessions</p>
                  </div>
                )}
                <Button asChild className="w-full" variant="outline">
                  <Link to="/mentors">Find More Mentors</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/sessions">View My Sessions</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading progress...</span>
                  </div>
                ) : learningProgress.length > 0 ? (
                  learningProgress.map((item) => (
                    <div key={item.skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.skill}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <p>No learning progress tracked yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          
        </div>
      </div>
    </div>
  </CandidateLayout>
);
}