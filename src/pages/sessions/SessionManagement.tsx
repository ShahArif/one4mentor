import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  Search, 
  Filter,
  Plus,
  MessageCircle,
  Star,
  Loader2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  session_type: string;
  duration_minutes: number;
  scheduled_date: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  location?: string;
  meeting_link?: string;
  notes?: string;
  mentor: {
    fullName: string;
    currentRole?: string;
    company?: string;
    expertise?: string;
  };
}

interface SessionStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, statusFilter]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch real sessions data for the candidate
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("candidate_id", user.id)
        .order("scheduled_date", { ascending: true });

      if (error) {
        console.error("Error fetching sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load sessions.",
          variant: "destructive",
        });
        return;
      }

      // Fetch mentor details for each session separately
      const sessionsWithMentorDetails = await Promise.all(
        (data || []).map(async (session) => {
          try {
            const { data: mentorData, error: mentorError } = await supabase
              .from("mentor_onboarding_requests")
              .select("data")
              .eq("user_id", session.mentor_id)
              .eq("status", "approved")
              .single();

            if (mentorError) {
              console.error("Error fetching mentor data for session:", mentorError);
            }

            return {
              id: session.id,
              session_type: session.session_type,
              duration_minutes: session.duration_minutes,
              scheduled_date: session.scheduled_date,
              status: session.status,
              location: session.location,
              meeting_link: session.meeting_link,
              notes: session.notes,
              mentor: {
                fullName: mentorData?.data?.fullName || "Unknown Mentor",
                currentRole: mentorData?.data?.currentRole,
                company: mentorData?.data?.company,
                expertise: mentorData?.data?.expertise
              }
            };
          } catch (error) {
            console.error(`Error fetching mentor details for session ${session.id}:`, error);
            return {
              id: session.id,
              session_type: session.session_type,
              duration_minutes: session.duration_minutes,
              scheduled_date: session.scheduled_date,
              status: session.status,
              location: session.location,
              meeting_link: session.meeting_link,
              notes: session.notes,
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

      setSessions(sessionsWithMentorDetails);
      
      // Calculate stats
      const total = sessionsWithMentorDetails.length;
      const scheduled = sessionsWithMentorDetails.filter(s => s.status === "scheduled").length;
      const completed = sessionsWithMentorDetails.filter(s => s.status === "completed").length;
      const cancelled = sessionsWithMentorDetails.filter(s => s.status === "cancelled").length;
      
      setStats({ total, scheduled, completed, cancelled });

    } catch (error) {
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

  const filterSessions = () => {
    let filtered = sessions;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.mentor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.session_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.mentor.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "rescheduled":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        return <Calendar className="h-4 w-4" />;
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

  const handleJoinSession = (session: Session) => {
    if (session.meeting_link) {
      window.open(session.meeting_link, "_blank");
    } else {
      toast({
        title: "No Meeting Link",
        description: "This session doesn't have a meeting link yet.",
        variant: "destructive",
      });
    }
  };

  const handleMessageMentor = (session: Session) => {
    // In a real implementation, this would open a chat interface
    toast({
      title: "Message Feature",
      description: "Messaging feature coming soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your mentorship sessions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold">{stats.scheduled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
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
              placeholder="Search sessions by mentor, type, or company..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {sessions.length === 0 ? "No Sessions Yet" : "No Matching Sessions"}
              </h3>
              <p className="text-gray-600 mb-4">
                {sessions.length === 0 
                  ? "You haven't scheduled any mentorship sessions yet. Start by finding mentors and sending mentorship requests."
                  : "Try adjusting your search criteria or status filter."
                }
              </p>
              {sessions.length === 0 && (
                <Button asChild>
                  <a href="/mentors">
                    <Plus className="h-4 w-4 mr-2" />
                    Find Mentors
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {getSessionTypeIcon(session.session_type)}
                          <span className="font-medium text-gray-900">
                            {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session
                          </span>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {session.mentor.fullName}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">
                            {session.mentor.currentRole && `${session.mentor.currentRole}`}
                            {session.mentor.company && ` at ${session.mentor.company}`}
                          </p>
                          {session.mentor.expertise && (
                            <p className="text-gray-500 text-sm">{session.mentor.expertise}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(session.scheduled_date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {session.duration_minutes} minutes
                          </div>
                          {session.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {session.location}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {session.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">{session.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {session.status === "scheduled" && session.meeting_link && (
                        <Button onClick={() => handleJoinSession(session)} size="sm">
                          Join Session
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleMessageMentor(session)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
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