import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CandidateLayout } from '@/components/layout/CandidateLayout';
import { 
  ArrowLeft, 
  Users, 
  Briefcase, 
  MessageCircle, 
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  User
} from 'lucide-react';

interface MentorshipRequest {
  id: string;
  mentor_id: string;
  candidate_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string;
  created_at: string;
  selected_skills?: string[];
  mentor: {
    fullName: string;
    currentRole?: string;
    company?: string;
    expertise?: string;
    email?: string;
  };
}

const CandidateRequests: React.FC = () => {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch mentorship requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('candidate_id', user?.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        setRequests([]);
        return;
      }

      // Fetch mentor details for each request separately
      const requestsWithMentorDetails = await Promise.all(
        (requestsData || []).map(async (req) => {
          try {
            const { data: mentorData, error: mentorError } = await supabase
              .from('mentor_onboarding_requests')
              .select('data')
              .eq('user_id', req.mentor_id)
              .eq('status', 'approved')
              .single();

            if (mentorError) {
              console.error('Error fetching mentor data:', mentorError);
            }

            return {
              id: req.id,
              mentor_id: req.mentor_id,
              candidate_id: req.candidate_id,
              status: req.status,
              message: req.message,
              created_at: req.created_at,
              selected_skills: req.selected_skills,
              mentor: {
                fullName: mentorData?.data?.fullName || 'Unknown Mentor',
                currentRole: mentorData?.data?.currentRole,
                company: mentorData?.data?.company,
                expertise: mentorData?.data?.expertise,
                email: mentorData?.data?.email
              }
            };
          } catch (error) {
            console.error(`Error fetching mentor details for request ${req.id}:`, error);
            return {
              id: req.id,
              mentor_id: req.mentor_id,
              candidate_id: req.candidate_id,
              status: req.status,
              message: req.message,
              created_at: req.created_at,
              selected_skills: req.selected_skills,
              mentor: {
                fullName: 'Unknown Mentor',
                currentRole: 'Unknown',
                company: 'Unknown',
                expertise: 'Unknown',
                email: 'Unknown'
              }
            };
          }
        })
      );

      setRequests(requestsWithMentorDetails);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">⏳ Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">✅ Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">❌ Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline">🚫 Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Waiting for mentor response';
      case 'accepted':
        return 'Mentor has accepted your request!';
      case 'rejected':
        return 'Mentor has declined your request';
      case 'cancelled':
        return 'Request has been cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading requests...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CandidateLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">My Mentorship Requests</h1>
              <p className="text-muted-foreground mt-2">
                Track the status of all your mentorship requests
              </p>
            </div>
            <Button asChild variant="default">
              <Link to="/mentors">
                <Users className="h-4 w-4 mr-2" />
                Find More Mentors
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'accepted').length}
                </div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'rejected').length}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Mentorship Requests Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't made any mentorship requests yet. Start by finding mentors and sending requests!
              </p>
              <Button asChild size="lg">
                <Link to="/mentors">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Mentors
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Link 
                        to={`/mentor/${request.mentor_id}`}
                        className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 transition-colors"
                      >
                        {request.mentor.fullName}
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {request.mentor.currentRole && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {request.mentor.currentRole}
                      </span>
                    )}
                    {request.mentor.company && (
                      <span>at {request.mentor.company}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(request.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Status Description */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        {getStatusDescription(request.status)}
                      </p>
                    </div>
                    
                    {/* Request Message */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your Request Message:</h4>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800">{request.message || "No message provided"}</p>
                      </div>
                    </div>

                    {/* Selected Skills */}
                    {request.selected_skills && request.selected_skills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Skills you want to learn:</h4>
                        <div className="flex flex-wrap gap-2">
                          {request.selected_skills.map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mentor Details */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Mentor Information:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Role:</span>
                          <span className="ml-2 font-medium">{request.mentor.currentRole || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Company:</span>
                          <span className="ml-2 font-medium">{request.mentor.company || 'Not specified'}</span>
                        </div>
                        {request.mentor.expertise && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">Expertise:</span>
                            <span className="ml-2 font-medium">{request.mentor.expertise}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
      </div>
    </CandidateLayout>
  );
};

export default CandidateRequests;
