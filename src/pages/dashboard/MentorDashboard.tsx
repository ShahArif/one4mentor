import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  MessageCircle,
  Star,
  Clock,
  ArrowRight,
  User,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLogout } from "@/hooks/use-logout";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { UniversalSidebar } from "@/components/layout/UniversalSidebar";
import { MentorInsights } from "@/components/dashboard/MentorInsights";

export default function MentorDashboard() {
  const { logout } = useLogout();
  const [mentorData, setMentorData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [acceptedCandidates, setAcceptedCandidates] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Fetch mentor profile data
      const { data: mentorProfile, error: profileError } = await supabase
        .from("mentor_onboarding_requests")
        .select("data")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .single();

      if (profileError) {
        console.error("Error fetching mentor profile:", profileError);
        return;
      }

      if (mentorProfile) {
        setMentorData(mentorProfile.data);
      }

      // Fetch pending mentorship requests count
      const { count: requestsCount, error: requestsError } = await supabase
        .from("mentorship_requests")
        .select("*", { count: "exact", head: true })
        .eq("mentor_id", user.id)
        .eq("status", "pending");

      if (requestsError) {
        console.error("Error fetching requests count:", requestsError);
      } else {
        setPendingRequests(requestsCount || 0);
      }

      // Fetch accepted candidates count
      const { count: candidatesCount, error: candidatesError } = await supabase
        .from("mentorship_requests")
        .select("*", { count: "exact", head: true })
        .eq("mentor_id", user.id)
        .eq("status", "accepted");

      if (candidatesError) {
        console.error("Error fetching accepted candidates count:", candidatesError);
      } else {
        setAcceptedCandidates(candidatesCount || 0);
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {mentorData?.fullName || "Mentor"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to inspire and guide the next generation of professionals
              </p>
            </div>
            <div className="flex items-center space-x-3">
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
              <Button variant="outline" asChild>
                <Link to="/mentors">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Candidates
                </Link>
              </Button>
              <Button asChild>
                <Link to="/mentor/requests">
                  <MessageCircle className="h-4 w-4 mr-2" /> View Requests
                  {pendingRequests > 0 && (<Badge variant="destructive" className="ml-2">{pendingRequests}</Badge>)}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Main Content with Sidebar */}
        <div className="flex gap-8 min-h-[calc(100vh-200px)]">
                            {/* Left Sidebar - Universal Navigation */}
                  <div className="w-64 flex-shrink-0">
                    <UniversalSidebar
                      pendingRequests={pendingRequests}
                      acceptedCandidates={acceptedCandidates}
                      sessionsThisMonth={0}
                    />
                  </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Link to="/mentor/candidates">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">My Candidates</p>
                        <p className="text-2xl font-bold text-gray-900">{acceptedCandidates}</p>
                        <p className="text-xs text-gray-500 mt-1">Accepted mentees</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sessions Completed</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Dashboard Insights */}
            <MentorInsights mentorId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}