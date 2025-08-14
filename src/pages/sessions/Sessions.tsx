import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  Video, 
  Phone, 
  MapPin,
  Plus,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  mentor_name: string;
  mentor_avatar?: string;
  session_type: "video" | "audio" | "in-person";
  duration: number;
  scheduled_date: string;
  status: "scheduled" | "completed" | "cancelled";
  location?: string;
  notes?: string;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll show a placeholder since we haven't implemented the sessions table yet
      // This would typically fetch from a sessions table
      setSessions([]);
      
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Phone className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sessions...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
              <p className="text-gray-600 mt-1">
                Manage your mentorship sessions and appointments
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book New Session
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't booked any mentorship sessions yet. 
                Start by finding a mentor and requesting a session.
              </p>
              <Button asChild>
                <a href="/mentors">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Find Mentors
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.mentor_avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {session.mentor_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.mentor_name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center text-gray-600">
                            {getSessionTypeIcon(session.session_type)}
                            <span className="ml-1 text-sm capitalize">{session.session_type}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-sm">{session.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {getStatusBadge(session.status)}
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(session.scheduled_date)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {session.location && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{session.location}</span>
                    </div>
                  )}
                  
                  {session.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 text-sm">{session.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                    {session.status === "scheduled" && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{sessions.filter(s => s.status === "scheduled").length}</div>
                <div className="text-gray-600">Upcoming Sessions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sessions.filter(s => s.status === "completed").length}</div>
                <div className="text-gray-600">Completed Sessions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{sessions.length}</div>
                <div className="text-gray-600">Total Sessions</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
