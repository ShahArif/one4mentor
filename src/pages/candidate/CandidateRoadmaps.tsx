import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  LayoutDashboard,
  FileText,
  MessageSquare,
  Video,
  Star,
  TrendingUp,
  Settings,
  Menu,
  X,
  MessageCircle,
  Edit,
  Save,
  XCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

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
  mentor_profile?: {
    display_name: string;
    email: string;
  };
}

export default function CandidateRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentingMilestone, setCommentingMilestone] = useState<string | null>(null);
  const [isMentorshipsExpanded, setIsMentorshipsExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      console.log('Fetching roadmaps for user:', user.id);

      // First, let's check if the table exists by doing a simple query
      const { data: tableCheck, error: tableError } = await supabase
        .from('learning_roadmaps')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('Table check error:', tableError);
        if (tableError.code === 'PGRST205') {
          toast({
            title: 'Database Error',
            description: 'The learning_roadmaps table does not exist. Please run the database migration first.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Database Error',
            description: `Failed to access learning roadmaps table: ${tableError.message}`,
            variant: 'destructive',
          });
        }
        return;
      }

      console.log('Table exists, fetching roadmaps...');

      // Try to fetch with the foreign key join first
      let { data, error } = await supabase
        .from('learning_roadmaps')
        .select(`
          *,
          mentor_profile:profiles!learning_roadmaps_mentor_id_fkey(display_name, email)
        `)
        .eq('candidate_id', user.id)
        .order('created_at', { ascending: false });

      // If the foreign key join fails, try without it
      if (error && error.message.includes('foreign key')) {
        console.log('Foreign key join failed, trying without join...');
        const { data: simpleData, error: simpleError } = await supabase
          .from('learning_roadmaps')
          .select('*')
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false });

        if (simpleError) {
          throw simpleError;
        }

        // Manually fetch mentor profiles for each roadmap
        const roadmapsWithProfiles = await Promise.all(
          (simpleData || []).map(async (roadmap) => {
            try {
              const { data: mentorData } = await supabase
                .from('profiles')
                .select('display_name, email')
                .eq('id', roadmap.mentor_id)
                .single();

              return {
                ...roadmap,
                mentor_profile: mentorData || { display_name: 'Unknown Mentor', email: 'Unknown' }
              };
            } catch (profileError) {
              console.log('Failed to fetch mentor profile for roadmap:', roadmap.id);
              return {
                ...roadmap,
                mentor_profile: { display_name: 'Unknown Mentor', email: 'Unknown' }
              };
            }
          })
        );

        data = roadmapsWithProfiles;
        error = null;
      }

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      console.log('Roadmaps fetched:', data);
      
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
    } catch (error: any) {
      console.error('Error fetching roadmaps:', error);
      toast({
        title: 'Error',
        description: `Failed to load learning roadmaps: ${error.message}`,
        variant: 'destructive',
      });
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

  const updateMilestoneProgress = async (roadmapId: string, milestoneIndex: number, newProgress: number) => {
    try {
      // Update the milestone in the JSONB array
      const roadmap = roadmaps.find(r => r.id === roadmapId);
      if (!roadmap) throw new Error('Roadmap not found');

      const updatedMilestones = [...roadmap.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        progress: Math.max(0, Math.min(100, newProgress)) // Ensure progress is between 0-100
      };

      const { error } = await supabase
        .from('learning_roadmaps')
        .update({ milestones: updatedMilestones })
        .eq('id', roadmapId);

      if (error) throw error;

      // Update local state
      setRoadmaps(prev => prev.map(roadmap => {
        if (roadmap.id === roadmapId) {
          return {
            ...roadmap,
            milestones: updatedMilestones
          };
        }
        return roadmap;
      }));

      toast({
        title: "Milestone Progress Updated",
        description: `Progress updated to ${Math.round(newProgress)}%`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update milestone progress: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const addComment = async (roadmapId: string, milestoneIndex: number) => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('milestone_comments')
        .insert({
          roadmap_id: roadmapId,
          milestone_index: milestoneIndex,
          user_id: user.id,
          comment: newComment.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setRoadmaps(prev => prev.map(roadmap => {
        if (roadmap.id === roadmapId) {
          const updatedMilestones = [...roadmap.milestones];
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            comments: [
              ...(updatedMilestones[milestoneIndex].comments || []),
              {
                ...data,
                user_email: user.email
              }
            ]
          };
          return {
            ...roadmap,
            milestones: updatedMilestones
          };
        }
        return roadmap;
      }));

      setNewComment('');
      setCommentingMilestone(null);

      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string, roadmapId: string, milestoneIndex: number) => {
    try {
      const { error } = await supabase
        .from('milestone_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Update local state
      setRoadmaps(prev => prev.map(roadmap => {
        if (roadmap.id === roadmapId) {
          const updatedMilestones = [...roadmap.milestones];
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            comments: (updatedMilestones[milestoneIndex].comments || []).filter(c => c.id !== commentId)
          };
          return {
            ...roadmap,
            milestones: updatedMilestones
          };
        }
        return roadmap;
      }));

      toast({
        title: "Comment Deleted",
        description: "Comment has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your learning roadmaps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white shadow-lg"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Side Navigation */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 min-h-screen p-4
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
          
                     <nav className="space-y-2">
             
             
             <Link
               to="/candidate/dashboard"
               className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               onClick={() => setIsSidebarOpen(false)}
             >
               <LayoutDashboard className="h-5 w-5" />
               <span>Dashboard</span>
             </Link>
             
             
             
             <Link
               to="/mentors"
               className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               onClick={() => setIsSidebarOpen(false)}
             >
               <Users className="h-5 w-5" />
               <span>Find Mentors</span>
             </Link>
             
             <Link
               to="/chat"
               className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               onClick={() => setIsSidebarOpen(false)}
             >
               <MessageSquare className="h-5 w-5" />
               <span>Chat</span>
             </Link>
             
             <Link
               to="/video-call"
               className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               onClick={() => setIsSidebarOpen(false)}
             >
               <Video className="h-5 w-5" />
               <span>Video Calls</span>
             </Link>
             
             <Link
               to="/analytics"
               className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               onClick={() => setIsSidebarOpen(false)}
             >
               <TrendingUp className="h-5 w-5" />
               <span>Analytics</span>
             </Link>
             
             
             
                           {/* Settings Section */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                  className="flex items-center justify-between w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                  </div>
                  {isSettingsExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                
                {/* Child Menu Items */}
                {isSettingsExpanded && (
                  <div className="ml-6 space-y-1 mt-2">
                    <Link
                      to="/profile/edit"
                      className="flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>General Settings</span>
                    </Link>
                  </div>
                )}
              </div>
             
             {/* My Mentorships Section */}
             <div className="pt-4 border-t border-gray-200">
               <button
                 onClick={() => setIsMentorshipsExpanded(!isMentorshipsExpanded)}
                 className="flex items-center justify-between w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
               >
                 <div className="flex items-center space-x-3">
                   <Users className="h-5 w-5" />
                   <span className="font-medium">My Mentorships</span>
                 </div>
                 {isMentorshipsExpanded ? (
                   <ChevronDown className="h-4 w-4 text-gray-500" />
                 ) : (
                   <ChevronRight className="h-4 w-4 text-gray-500" />
                 )}
               </button>
               
                               {/* Child Menu Items */}
                {isMentorshipsExpanded && (
                  <div className="ml-6 space-y-1 mt-2">
                    <Link
                      to="/candidate/requests"
                      className="flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <FileText className="h-4 w-4" />
                      <span>My Requests</span>
                    </Link>
                    
                    <Link
                      to="/sessions"
                      className="flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Sessions</span>
                    </Link>
                    
                    <Link
                      to="/session-feedback"
                      className="flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Star className="h-4 w-4" />
                      <span>Feedback</span>
                    </Link>
                    
                    <Link
                      to="/reviews"
                      className="flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Star className="h-4 w-4" />
                      <span>Reviews</span>
                    </Link>
                  </div>
                )}
             </div>
           </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning Roadmaps</h1>
          <p className="text-gray-600 mt-2">
            Track your learning progress with roadmaps created by your mentors
          </p>
          
          {/* Debug Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Debug Info:</strong> Check the browser console for detailed error information.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              If you see "table does not exist" errors, please run the database migration first.
            </p>
          </div>
        </div>

        {roadmaps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Learning Roadmaps Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Your mentors will create learning roadmaps for you once they accept your mentorship requests.
              </p>
              <Button asChild className="btn-gradient">
                <Link to="/mentors">
                  <Users className="h-4 w-4 mr-2" />
                  Find Mentors
                </Link>
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
                            by {roadmap.mentor_profile?.display_name || 'Unknown Mentor'}
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
                                 <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                   <span className="flex items-center gap-1">
                                     <Clock className="h-3 w-3" />
                                     {milestone.estimatedHours}h
                                   </span>
                                   <span className="flex items-center gap-1">
                                     <Calendar className="h-3 w-3" />
                                     {new Date(roadmap.created_at).toLocaleDateString()}
                                   </span>
                                 </div>

                                                                   {/* Progress Update */}
                                  <div className="border-t pt-3 mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h6 className="text-sm font-medium text-gray-700">Progress</h6>
                                      <span className="text-sm text-gray-600">{milestone.progress}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Progress value={milestone.progress} className="flex-1 h-2" />
                                      <div className="flex items-center gap-2">
                                                                                 <Input
                                           type="number"
                                           min="0"
                                           max="100"
                                           value={milestone.progress}
                                           onChange={(e) => {
                                             const value = parseInt(e.target.value) || 0;
                                             // Don't update immediately on every keystroke, wait for blur or enter
                                           }}
                                           onBlur={(e) => {
                                             const value = parseInt((e.target as HTMLInputElement).value) || 0;
                                             updateMilestoneProgress(roadmap.id, milestoneIndex, value);
                                           }}
                                           onKeyDown={(e) => {
                                             if (e.key === 'Enter') {
                                               const value = parseInt((e.target as HTMLInputElement).value) || 0;
                                               updateMilestoneProgress(roadmap.id, milestoneIndex, value);
                                               (e.target as HTMLInputElement).blur();
                                             }
                                           }}
                                           className="w-16 h-8 text-xs text-center"
                                         />
                                        <span className="text-xs text-gray-500">%</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateMilestoneProgress(roadmap.id, milestoneIndex, 0)}
                                        className="text-xs"
                                      >
                                        0%
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateMilestoneProgress(roadmap.id, milestoneIndex, 25)}
                                        className="text-xs"
                                      >
                                        25%
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateMilestoneProgress(roadmap.id, milestoneIndex, 50)}
                                        className="text-xs"
                                      >
                                        50%
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateMilestoneProgress(roadmap.id, milestoneIndex, 75)}
                                        className="text-xs"
                                      >
                                        75%
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateMilestoneProgress(roadmap.id, milestoneIndex, 100)}
                                        className="text-xs"
                                      >
                                        100%
                                      </Button>
                                    </div>
                                  </div>

                                 {/* Comments Section */}
                                 <div className="border-t pt-3">
                                   <div className="flex items-center justify-between mb-2">
                                     <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                       <MessageCircle className="h-4 w-4" />
                                       Comments ({milestone.comments?.length || 0})
                                     </h5>
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => setCommentingMilestone(
                                         commentingMilestone === `${roadmap.id}-${milestoneIndex}` ? null : `${roadmap.id}-${milestoneIndex}`
                                       )}
                                       className="text-xs"
                                     >
                                       {commentingMilestone === `${roadmap.id}-${milestoneIndex}` ? 'Cancel' : 'Add Comment'}
                                     </Button>
                                   </div>

                                   {/* Add Comment Form */}
                                   {commentingMilestone === `${roadmap.id}-${milestoneIndex}` && (
                                     <div className="mb-3">
                                       <Textarea
                                         placeholder="Add your comment..."
                                         value={newComment}
                                         onChange={(e) => setNewComment(e.target.value)}
                                         className="mb-2"
                                         rows={2}
                                       />
                                       <div className="flex gap-2">
                                         <Button
                                           size="sm"
                                           onClick={() => addComment(roadmap.id, milestoneIndex)}
                                           disabled={!newComment.trim()}
                                         >
                                           <MessageCircle className="h-3 w-3 mr-1" />
                                           Add Comment
                                         </Button>
                                         <Button
                                           variant="outline"
                                           size="sm"
                                           onClick={() => {
                                             setCommentingMilestone(null);
                                             setNewComment('');
                                           }}
                                         >
                                           <XCircle className="h-3 w-3 mr-1" />
                                           Cancel
                                         </Button>
                                       </div>
                                     </div>
                                   )}

                                   {/* Display Comments */}
                                   {milestone.comments && milestone.comments.length > 0 && (
                                     <div className="space-y-2">
                                       {milestone.comments.map((comment) => (
                                         <div key={comment.id} className="bg-white p-2 rounded border">
                                           <div className="flex items-start justify-between">
                                             <div className="flex-1">
                                               <p className="text-xs text-gray-500 mb-1">
                                                 {comment.user_email || 'Unknown User'} • {new Date(comment.created_at).toLocaleDateString()}
                                               </p>
                                               <p className="text-sm text-gray-700">{comment.comment}</p>
                                             </div>
                                             <Button
                                               variant="ghost"
                                               size="sm"
                                               onClick={() => deleteComment(comment.id, roadmap.id, milestoneIndex)}
                                               className="text-red-500 hover:text-red-700 p-1 h-auto"
                                             >
                                               <XCircle className="h-3 w-3" />
                                             </Button>
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   )}
                                 </div>
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
      </div>
    </div>
  );
}
