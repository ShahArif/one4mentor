import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MessageSquare, Star, Download, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Mock session data
const upcomingSessions = [
  {
    id: "1",
    mentorName: "Sarah Johnson",
    mentorImage: "/placeholder.svg",
    date: "Mar 25, 2024",
    time: "2:00 PM",
    duration: "60 min",
    topic: "React Best Practices",
    status: "confirmed",
    amount: "₹90",
    meetingLink: "https://meet.google.com/abc-defg-hij"
  },
  {
    id: "2",
    mentorName: "David Chen",
    mentorImage: "/placeholder.svg",
    date: "Mar 27, 2024",
    time: "4:00 PM",
    duration: "90 min",
    topic: "System Design Interview",
    status: "pending",
    amount: "₹120",
    meetingLink: null
  }
];

const pastSessions = [
  {
    id: "3",
    mentorName: "Michael Brown",
    mentorImage: "/placeholder.svg",
    date: "Mar 20, 2024",
    time: "3:00 PM",
    duration: "60 min",
    topic: "JavaScript Fundamentals",
    status: "completed",
    amount: "₹90",
    rating: 5,
    feedback: "Great session! Michael explained concepts very clearly."
  },
  {
    id: "4",
    mentorName: "Emily Davis",
    mentorImage: "/placeholder.svg",
    date: "Mar 18, 2024",
    time: "10:00 AM",
    duration: "30 min",
    topic: "Career Guidance",
    status: "completed",
    amount: "₹50",
    rating: 4,
    feedback: "Very helpful insights about career transition."
  }
];

const SessionManagement = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Payment Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderUpcomingSession = (session: any) => (
    <Card key={session.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Avatar>
              <AvatarImage src={session.mentorImage} alt={session.mentorName} />
              <AvatarFallback>{session.mentorName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{session.topic}</h3>
              <p className="text-muted-foreground">with {session.mentorName}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{session.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{session.time} ({session.duration})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                {getStatusBadge(session.status)}
                <span className="font-semibold text-primary">{session.amount}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {session.meetingLink ? (
              <Button size="sm" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Join Meeting
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                <Clock className="w-4 h-4 mr-2" />
                Awaiting Payment
              </Button>
            )}
            <Button size="sm" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPastSession = (session: any) => (
    <Card key={session.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Avatar>
              <AvatarImage src={session.mentorImage} alt={session.mentorName} />
              <AvatarFallback>{session.mentorName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{session.topic}</h3>
              <p className="text-muted-foreground">with {session.mentorName}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{session.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{session.time} ({session.duration})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                {getStatusBadge(session.status)}
                <span className="font-semibold text-primary">{session.amount}</span>
              </div>
              
              {session.rating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= session.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Your Rating</span>
                </div>
              )}
              
              {session.feedback && (
                <p className="text-sm text-muted-foreground mt-2 italic">"{session.feedback}"</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Notes
            </Button>
            <Button size="sm" variant="outline">
              Book Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Sessions</h1>
          <p className="text-muted-foreground">Manage your mentorship sessions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Upcoming Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Completed Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">₹1,200</div>
              <div className="text-sm text-muted-foreground">Total Invested</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>View and manage your mentorship sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
                <TabsTrigger value="past">Past Sessions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-6">
                {upcomingSessions.length > 0 ? (
                  <div>
                    {upcomingSessions.map(renderUpcomingSession)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                    <p className="text-muted-foreground mb-4">Book a session with a mentor to get started</p>
                    <Link to="/mentors">
                      <Button>Browse Mentors</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="past" className="mt-6">
                {pastSessions.length > 0 ? (
                  <div>
                    {pastSessions.map(renderPastSession)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Past Sessions</h3>
                    <p className="text-muted-foreground">Your completed sessions will appear here</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SessionManagement;