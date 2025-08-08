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
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLogout } from "@/hooks/use-logout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";

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

function CandidateDashboardInner() {
  const { logout } = useLogout();
  const { profile } = useAuth();
  const displayName = profile?.display_name || profile?.email || "there";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
              <p className="text-muted-foreground">Continue your learning journey</p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-gradient-primary">
                <Bell className="h-4 w-4 mr-2" />
                3 New
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

export default function CandidateDashboard() {
  return (
    <ProtectedRoute requiredRoles={["candidate"]}>
      <CandidateDashboardInner />
    </ProtectedRoute>
  );
}