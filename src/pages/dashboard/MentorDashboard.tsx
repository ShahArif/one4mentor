import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  Star,
  Clock,
  Award,
  ArrowRight,
  CheckCircle,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function MentorDashboard() {
  const [mentorData, setMentorData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
              <Button variant="outline" asChild>
                <Link to="/mentors">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Mentors
                </Link>
              </Button>
              <Button asChild>
                <Link to="/mentor/requests">
                  <MessageCircle className="h-4 w-4 mr-2" /> View Requests
                  {pendingRequests > 0 && (<Badge variant="destructive" className="ml-2">{pendingRequests}</Badge>)}
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link to="/mentors">
                  <User className="h-4 w-4 mr-2" /> Browse Candidates
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

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

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Mentorship Requests
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/mentor/requests">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-full mr-3">
                      <MessageCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {pendingRequests} new mentorship request{pendingRequests > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        Review and respond to candidate requests
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link to="/mentor/requests">Review</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No pending requests at the moment</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Candidates will send you requests when they view your profile
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/mentor/profile">
                    <User className="h-4 w-4 mr-2" />
                    Update Profile
                  </Link>
                </Button>
                
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/mentors">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Other Mentors
                  </Link>
                </Button>
                
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/mentor/requests">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Manage Requests
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Status */}
        {mentorData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Profile Complete</h4>
                  <p className="text-sm text-gray-600">Your profile is ready for candidates</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Experience</h4>
                  <p className="text-sm text-gray-600">{mentorData.experience || "Not specified"}</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Hourly Rate</h4>
                  <p className="text-sm text-gray-600">₹{mentorData.hourlyRate || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}