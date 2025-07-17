import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MessageCircle, 
  DollarSign, 
  Star, 
  Clock,
  Users,
  TrendingUp,
  Bell,
  CheckCircle,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const pendingRequests = [
  {
    id: 1,
    candidate: "John Doe",
    type: "Mock Interview",
    requestedDate: "Tomorrow, 3:00 PM",
    duration: "60 mins",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    candidate: "Jane Smith",
    type: "Career Guidance",
    requestedDate: "Friday, 11:00 AM",
    duration: "45 mins",
    avatar: "/api/placeholder/40/40"
  }
];

const upcomingSessions = [
  {
    id: 1,
    candidate: "Alex Kumar",
    type: "Technical Interview",
    date: "Today, 4:00 PM",
    duration: "60 mins",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    candidate: "Sarah Wilson",
    type: "Resume Review",
    date: "Tomorrow, 10:00 AM",
    duration: "30 mins",
    avatar: "/api/placeholder/40/40"
  }
];

const recentEarnings = [
  { month: "December", amount: 15000, sessions: 12 },
  { month: "November", amount: 18000, sessions: 15 },
  { month: "October", amount: 12000, sessions: 10 }
];

const activeCandidates = [
  {
    id: 1,
    name: "Alice Chen",
    progress: "JavaScript Fundamentals",
    lastSession: "2 days ago",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    name: "Bob Martinez",
    progress: "System Design",
    lastSession: "1 week ago",
    avatar: "/api/placeholder/40/40"
  }
];

export default function MentorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Sarah!</h1>
              <p className="text-muted-foreground">Manage your mentoring sessions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                2 Requests
              </Button>
              <Badge variant="secondary">Verified Mentor</Badge>
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
                <DollarSign className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">₹15,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                <Star className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">4.9</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={request.avatar} />
                        <AvatarFallback>{request.candidate[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{request.candidate}</h4>
                        <p className="text-sm text-muted-foreground">{request.type}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {request.requestedDate} • {request.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-gradient-primary">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

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
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={session.avatar} />
                        <AvatarFallback>{session.candidate[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{session.candidate}</h4>
                        <p className="text-sm text-muted-foreground">{session.type}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.date} • {session.duration}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Start</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Earnings Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Earnings Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentEarnings.map((earning) => (
                  <div key={earning.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{earning.month}</h4>
                      <p className="text-sm text-muted-foreground">{earning.sessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{earning.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Active Candidates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">{candidate.progress}</p>
                        <p className="text-xs text-muted-foreground">Last: {candidate.lastSession}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
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
                  <Link to="/mentor/profile">Edit Profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/mentor/schedule">Manage Schedule</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/mentor/earnings">View Earnings</Link>
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