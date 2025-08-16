import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Clock, 
  CheckCircle, 
  Calendar,
  ArrowLeft,
  Home,
  User,
  Users,
  Plus,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import LearningRoadmap from '@/components/mentor/LearningRoadmap';

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  order: number;
  progress: number; // Progress as percentage (0-100)
  comments?: MilestoneComment[];
}

interface MilestoneComment {
  id: string;
  milestone_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user_email?: string;
}

interface LearningRoadmap {
  id: string;
  mentor_id: string;
  candidate_id: string;
  mentorship_request_id: string;
  title: string;
  description: string;
  skills: string[];
  milestones: LearningMilestone[];
  created_at: string;
  updated_at: string;
}

interface CandidateProfile {
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
}

export default function CandidateRoadmaps() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [previousProgress, setPreviousProgress] = useState<{[key: string]: number}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (candidateId) {
      fetchCandidateData();
      fetchRoadmaps();
      
      // Set up auto-refresh every 30 seconds to see real-time progress updates
      const interval = setInterval(() => {
        fetchRoadmaps();
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (error) {
        console.error('Error fetching candidate:', error);
        toast({
          title: 'Error',
          description: 'Failed to load candidate information.',
          variant: 'destructive',
        });
        return;
      }

      setCandidate(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkProgressChanges = (newRoadmaps: LearningRoadmap[]) => {
    newRoadmaps.forEach(roadmap => {
      roadmap.milestones.forEach((milestone, index) => {
        const milestoneKey = `${roadmap.id}-${index}`;
        const previousProgress = previousProgress[milestoneKey] || 0;
        
        if (milestone.progress !== previousProgress) {
          // Only show notification if it's not the initial load
          if (Object.keys(previousProgress).length > 0) {
            toast({
              title: "Progress Updated",
              description: `${milestone.title} progress changed from ${previousProgress}% to ${milestone.progress}%`,
            });
          }
        }
      });
    });
    
    // Update previous progress state
    const newProgressState: {[key: string]: number} = {};
    newRoadmaps.forEach(roadmap => {
      roadmap.milestones.forEach((milestone, index) => {
        const milestoneKey = `${roadmap.id}-${index}`;
        newProgressState[milestoneKey] = milestone.progress;
      });
    });
    setPreviousProgress(newProgressState);
  };

  const fetchRoadmaps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('learning_roadmaps')
        .select('*')
        .eq('mentor_id', user.id)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching roadmaps:', error);
        toast({
          title: 'Error',
          description: 'Failed to load learning roadmaps.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch comments for all milestones
      if (data && data.length > 0) {
        const roadmapsWithComments = await Promise.all(
          data.map(async (roadmap) => {
            try {
              const { data: commentsData } = await supabase
                .from('milestone_comments')
                .select('*')
                .eq('roadmap_id', roadmap.id)
                .order('created_at', { ascending: true });

              // Merge comments with milestones based on milestone_index
              const milestonesWithComments = roadmap.milestones.map((milestone, index) => ({
                ...milestone,
                comments: commentsData?.filter(c => c.milestone_index === index) || []
              }));

              return {
                ...roadmap,
                milestones: milestonesWithComments
              };
            } catch (commentError) {
              console.log('Failed to fetch comments for roadmap:', roadmap.id);
              return roadmap;
            }
          })
        );

        setRoadmaps(roadmapsWithComments);
      } else {
        setRoadmaps(data || []);
      }
      
      setLastRefreshed(new Date());
      
      // Check for progress changes and notify mentor
      checkProgressChanges(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (milestones: LearningMilestone[]) => {
    if (milestones.length === 0) return 0;
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / milestones.length);
  };

  const calculateTotalHours = (milestones: LearningMilestone[]) => {
    return milestones.reduce((sum, m) => sum + m.estimatedHours, 0);
  };

  const calculateCompletedHours = (milestones: LearningMilestone[]) => {
    return milestones
      .reduce((sum, m) => sum + (m.progress / 100) * m.estimatedHours, 0);
  };

  const handleRoadmapCreated = () => {
    setShowCreateForm(false);
    fetchRoadmaps();
    toast({
      title: 'Success',
      description: 'Learning roadmap created successfully!',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading candidate roadmaps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Candidate not found.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
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
              <Link to="/mentor/candidates">
                <Users className="h-4 w-4 mr-2" />
                My Candidates
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

        {/* Candidate Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {candidate.candidate_data?.fullName || candidate.display_name || "Candidate"} - Learning Roadmaps
              </h1>
              <p className="text-gray-600 mt-2">
                Manage learning roadmaps and track progress for {candidate.candidate_data?.fullName || candidate.display_name || "this candidate"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastRefreshed.toLocaleTimeString()} • Auto-refresh every 30 seconds
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => fetchRoadmaps()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Progress
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="btn-gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Roadmap
              </Button>
            </div>
          </div>
        </div>

        {/* Create Roadmap Form */}
        {showCreateForm && (
          <div className="mb-8">
            <LearningRoadmap
              candidateId={candidateId!}
              mentorshipRequestId=""
              selectedSkills={[]}
              onRoadmapCreated={handleRoadmapCreated}
              onClose={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Progress Summary */}
        {roadmaps.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {roadmaps.length}
                    </div>
                    <div className="text-sm text-blue-600">Total Roadmaps</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {roadmaps.reduce((total, roadmap) => total + calculateProgress(roadmap.milestones), 0) / roadmaps.length}%
                    </div>
                    <div className="text-sm text-green-600">Average Progress</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {roadmaps.reduce((total, roadmap) => 
                        total + roadmap.milestones.filter(m => m.progress === 100).length, 0
                      )}
                    </div>
                    <div className="text-sm text-purple-600">Completed Milestones</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {roadmaps.reduce((total, roadmap) => 
                        total + roadmap.milestones.length, 0
                      )}
                    </div>
                    <div className="text-sm text-orange-600">Total Milestones</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Roadmaps List */}
        {roadmaps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Learning Roadmaps Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first learning roadmap to help {candidate.candidate_data?.fullName || candidate.display_name || "this candidate"} achieve their goals.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="btn-gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Roadmap
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {roadmaps.map((roadmap) => {
              const progress = calculateProgress(roadmap.milestones);
              const totalHours = calculateTotalHours(roadmap.milestones);
              const completedHours = calculateCompletedHours(roadmap.milestones);
              const isExpanded = expandedRoadmap === roadmap.id;

              return (
                <Card key={roadmap.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Created {new Date(roadmap.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{roadmap.description}</p>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {roadmap.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Progress and Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Overall Progress:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={progress} className="flex-1 h-2" />
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {roadmap.milestones.filter(m => m.progress === 100).length} of {roadmap.milestones.length} milestones completed
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Milestones:</span>
                            <p className="font-medium">{roadmap.milestones.length}</p>
                            <div className="flex gap-1 mt-1">
                              {roadmap.milestones.map((milestone, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${
                                    milestone.progress === 100 ? 'bg-green-500' :
                                    milestone.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                  title={`${milestone.title}: ${milestone.progress}%`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Hours:</span>
                            <p className="font-medium">{Math.round(completedHours)}/{totalHours}h</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.round((completedHours / totalHours) * 100)}% of estimated time
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRoadmap(isExpanded ? null : roadmap.id)}
                        className="ml-4"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Expanded Milestones */}
                  {isExpanded && (
                    <CardContent className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-4">Learning Milestones</h4>
                      <div className="space-y-3">
                        {roadmap.milestones.map((milestone, milestoneIndex) => (
                          <div
                            key={`${roadmap.id}-${milestoneIndex}`}
                            className={`p-3 rounded-lg border ${
                              milestone.progress === 100
                                ? 'bg-green-50 border-green-200'
                                : milestone.progress > 0
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    Step {milestone.order}
                                  </Badge>
                                  <span className={`font-medium ${
                                    milestone.progress === 100 ? 'text-green-700' : milestone.progress > 0 ? 'text-blue-700' : 'text-gray-900'
                                  }`}>
                                    {milestone.title}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {milestone.description}
                                </p>
                                
                                {/* Progress Display */}
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Progress: {milestone.progress}%</span>
                                  </div>
                                  <Progress value={milestone.progress} className="h-2" />
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {milestone.estimatedHours}h
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(roadmap.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {/* Comments Display */}
                                {milestone.comments && milestone.comments.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                      <MessageCircle className="h-4 w-4" />
                                      Comments ({milestone.comments.length})
                                    </h6>
                                    <div className="space-y-2">
                                      {milestone.comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-50 p-2 rounded border">
                                          <p className="text-xs text-gray-500 mb-1">
                                            {comment.user_email || 'Unknown User'} • {new Date(comment.created_at).toLocaleDateString()}
                                          </p>
                                          <p className="text-sm text-gray-700">{comment.comment}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ml-2">
                                {milestone.progress === 100 ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 fill-current" />
                                ) : milestone.progress > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-blue-600 font-medium">{milestone.progress}%</span>
                                  </div>
                                ) : (
                                  <Clock className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
