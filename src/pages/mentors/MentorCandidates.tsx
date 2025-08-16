import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  Target,
  ArrowLeft,
  Home,
  User,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface AcceptedCandidate {
  id: string;
  mentorship_request_id: string;
  candidate: {
    id: string;
    email: string;
    display_name: string;
    candidate_data?: {
      fullName?: string;
      currentRole?: string;
      company?: string;
      experience?: string;
      skills?: string[];
      goals?: string[];
      bio?: string;
    };
  };
  selected_skills: string[];
  message: string;
  created_at: string;
  updated_at: string;
  roadmaps_count: number;
}

export default function MentorCandidates() {
  const [candidates, setCandidates] = useState<AcceptedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAcceptedCandidates();
  }, []);

  const fetchAcceptedCandidates = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch accepted mentorship requests first
      const { data: requestsData, error: requestsError } = await supabase
        .from('mentorship_requests')
        .select(`
          id,
          candidate_id,
          selected_skills,
          message,
          created_at,
          updated_at
        `)
        .eq('mentor_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching mentorship requests:', requestsError);
        toast({
          title: 'Error',
          description: 'Failed to load mentorship requests.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch candidate profiles separately
      const candidatesWithProfiles = await Promise.all(
        (requestsData || []).map(async (request) => {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, email, display_name, candidate_data')
              .eq('id', request.candidate_id)
              .single();

            if (profileError) {
              console.error('Error fetching profile for candidate:', request.candidate_id, profileError);
              return {
                id: request.id,
                mentorship_request_id: request.id,
                candidate_id: request.candidate_id,
                selected_skills: request.selected_skills || [],
                message: request.message,
                created_at: request.created_at,
                updated_at: request.updated_at,
                candidate: {
                  id: request.candidate_id,
                  email: 'Unknown',
                  display_name: 'Unknown Candidate',
                  candidate_data: {}
                },
                roadmaps_count: 0
              };
            }

            return {
              id: request.id,
              mentorship_request_id: request.id,
              candidate_id: request.candidate_id,
              selected_skills: request.selected_skills || [],
              message: request.message,
              created_at: request.created_at,
              updated_at: request.updated_at,
              candidate: profileData,
              roadmaps_count: 0
            };
          } catch (error) {
            console.error('Error processing candidate:', request.candidate_id, error);
            return {
              id: request.id,
              mentorship_request_id: request.id,
              candidate_id: request.candidate_id,
              selected_skills: request.selected_skills || [],
              message: request.message,
              created_at: request.created_at,
              updated_at: request.updated_at,
              candidate: {
                id: request.candidate_id,
                email: 'Error',
                display_name: 'Error Loading Candidate',
                candidate_data: {}
              },
              roadmaps_count: 0
            };
          }
        })
      );

      // For each candidate, get the count of roadmaps
      const candidatesWithRoadmaps = await Promise.all(
        candidatesWithProfiles.map(async (candidate) => {
          try {
            const { count: roadmapsCount } = await supabase
              .from('learning_roadmaps')
              .select('*', { count: 'exact', head: true })
              .eq('candidate_id', candidate.candidate_id)
              .eq('mentor_id', user.id);

            return {
              ...candidate,
              roadmaps_count: roadmapsCount || 0
            };
          } catch (error) {
            console.error('Error fetching roadmaps count for candidate:', candidate.candidate_id, error);
            return {
              ...candidate,
              roadmaps_count: 0
            };
          }
        })
      );

      setCandidates(candidatesWithRoadmaps);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load candidates.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your candidates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/mentor/dashboard">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/mentor/requests">
                <MessageCircle className="h-4 w-4 mr-2" />
                View Requests
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/profile/edit">
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Candidates</h1>
          <p className="text-gray-600 mt-2">
            Manage your accepted mentorship relationships and view learning progress
          </p>
        </div>

        {candidates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Accepted Candidates Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't accepted any mentorship requests yet. Check your pending requests to get started.
              </p>
              <Button asChild className="btn-gradient">
                <Link to="/mentor/requests">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View Pending Requests
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.candidate.display_name || candidate.candidate.email}`} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                          {(candidate.candidate.display_name || candidate.candidate.email || "U")
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <CardTitle className="text-xl">
                          {candidate.candidate.candidate_data?.fullName || candidate.candidate.display_name || "Anonymous Candidate"}
                        </CardTitle>
                        <p className="text-gray-600 text-sm">
                          {candidate.candidate.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Accepted {formatDate(candidate.created_at)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {candidate.roadmaps_count} Roadmap{candidate.roadmaps_count !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/mentor/candidates/${candidate.candidate.id}/roadmaps`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Roadmaps
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Selected Skills */}
                  {candidate.selected_skills && candidate.selected_skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Skills they want to learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.selected_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Message */}
                  {candidate.message && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Initial Request Message:</h4>
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {candidate.message}
                      </p>
                    </div>
                  )}

                  {/* Candidate Details */}
                  {candidate.candidate.candidate_data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Current Role:</span>
                        <p className="text-sm text-gray-900">
                          {candidate.candidate.candidate_data.currentRole || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Experience:</span>
                        <p className="text-sm text-gray-900">
                          {candidate.candidate.candidate_data.experience || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Company:</span>
                        <p className="text-sm text-gray-900">
                          {candidate.candidate.candidate_data.company || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Goals:</span>
                        <p className="text-sm text-gray-900">
                          {candidate.candidate.candidate_data.goals && Array.isArray(candidate.candidate.candidate_data.goals) 
                            ? candidate.candidate.candidate_data.goals.slice(0, 2).join(', ') + 
                              (candidate.candidate.candidate_data.goals.length > 2 ? '...' : '')
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
