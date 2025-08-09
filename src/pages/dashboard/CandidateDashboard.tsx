import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/use-logout";
import { useToast } from "@/hooks/use-toast";

const upcomingSessions = [
  {
    id: 1,
    mentor: "Sarah Chen",
    type: "Mock Interview",
    date: "Tomorrow, 2:00 PM",
    duration: "60 mins"
  },
  {
    id: 2,
    mentor: "Raj Patel",
    type: "Career Guidance",
    date: "Friday, 10:00 AM",
    duration: "45 mins"
  }
];

const recentFeedback = [
  {
    id: 1,
    mentor: "Sarah Chen",
    rating: 5,
    feedback: "Excellent communication skills, work on technical depth",
    date: "2 days ago"
  },
  {
    id: 2,
    mentor: "Mike Johnson",
    rating: 4,
    feedback: "Good problem-solving approach, practice more DSA",
    date: "1 week ago"
  }
];

const learningProgress = [
  { skill: "JavaScript", progress: 80 },
  { skill: "React", progress: 65 },
  { skill: "System Design", progress: 40 },
  { skill: "Data Structures", progress: 75 }
];

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
            .select("data")
            .eq("user_id", user.id)
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const needsCompletion = !candidateRequest?.data?.bio || 
                                 candidateRequest.data.bio === "New candidate - profile incomplete" ||
                                 !candidateRequest?.data?.skills?.length ||
                                 !candidateRequest?.data?.experience ||
                                 candidateRequest.data.experience === "Entry Level";

          setApprovalStatus({ 
            isApproved: true, 
            isLoading: false,
            needsProfileCompletion: needsCompletion
          });
        } else {
          // Handle users without candidate role
          const { data: candidateRequest } = await supabase
            .from("candidate_onboarding_requests")
            .select("status")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (candidateRequest) {
            setApprovalStatus({
              isApproved: false,
              isLoading: false,
              applicationStatus: candidateRequest.status
            });
          } else {
            // No role and no application - this should rarely happen with new registration flow
            setApprovalStatus({ 
              isApproved: true, 
              isLoading: false,
              needsProfileCompletion: true
            });
          }
        }

      } catch (error) {
        console.error("Error checking approval status:", error);
        setApprovalStatus({ isApproved: false, isLoading: false });
      }
    };

    checkApprovalStatus();
  }, [navigate, toast]);

  if (approvalStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 animate-spin" />
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
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
              <p className="text-gray-600">Manage your mentorship journey</p>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {approvalStatus.needsProfileCompletion && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded-r-lg">
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
            <Button 
              size="sm" 
              onClick={() => navigate("/onboarding/candidate")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      )}

      {/* Hero CTA for Finding Mentors */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">🚀 Ready to Level Up Your Career?</h2>
            <p className="text-white/90 mb-4 max-w-2xl mx-auto">
              Connect with industry experts, get personalized guidance, and accelerate your professional growth
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/mentors">
                  <Users className="h-5 w-5 mr-2" />
                  Browse Mentors
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
                <Link to="/sessions">
                  <Calendar className="h-5 w-5 mr-2" />
                  My Sessions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Mentors</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">4.6</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-2xl font-bold">8/10</p>
                </div>
              </div>
            </CardContent>
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
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{session.type}</h4>
                      <p className="text-sm text-muted-foreground">with {session.mentor}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.date} • {session.duration}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Join</Button>
                  </div>
                ))}
                <Button asChild className="w-full" variant="outline">
                  <Link to="/mentors">Find More Mentors</Link>
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
                {learningProgress.map((item) => (
                  <div key={item.skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.skill}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Recent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{feedback.mentor}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{feedback.feedback}</p>
                    <p className="text-xs text-muted-foreground">{feedback.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button asChild className="bg-gradient-primary">
                  <Link to="/mentors">Find Mentors</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/sessions">View Sessions</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/profile">Edit Profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/chat">Messages</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}