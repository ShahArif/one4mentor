import React, { useState, useEffect } from 'react';
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
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LearningRoadmap from './LearningRoadmap';

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  order: number;
  isCompleted: boolean;
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

interface RoadmapDisplayProps {
  mentorshipRequestId: string;
  candidateId: string;
  selectedSkills: string[];
}

export default function RoadmapDisplay({
  mentorshipRequestId,
  candidateId,
  selectedSkills
}: RoadmapDisplayProps) {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoadmaps();
  }, [mentorshipRequestId]);

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('learning_roadmaps')
        .select('*')
        .eq('mentorship_request_id', mentorshipRequestId)
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRoadmaps(data || []);
    } catch (error: any) {
      console.error('Error fetching roadmaps:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning roadmaps.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoadmapCreated = (newRoadmap: LearningRoadmap) => {
    setRoadmaps(prev => [newRoadmap, ...prev]);
    setShowCreateForm(false);
    toast({
      title: 'Success!',
      description: 'Learning roadmap created successfully.',
    });
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    try {
      const { error } = await supabase
        .from('learning_roadmaps')
        .delete()
        .eq('id', roadmapId);

      if (error) throw error;

      setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
      toast({
        title: 'Roadmap Deleted',
        description: 'The learning roadmap has been removed.',
      });
    } catch (error: any) {
      console.error('Error deleting roadmap:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the roadmap.',
        variant: 'destructive',
      });
    }
  };

  const toggleMilestoneCompletion = async (roadmapId: string, milestoneId: string) => {
    try {
      const roadmap = roadmaps.find(r => r.id === roadmapId);
      if (!roadmap) return;

      const updatedMilestones = roadmap.milestones.map(milestone =>
        milestone.id === milestoneId
          ? { ...milestone, isCompleted: !milestone.isCompleted }
          : milestone
      );

      const { error } = await supabase
        .from('learning_roadmaps')
        .update({ 
          milestones: updatedMilestones,
          updated_at: new Date().toISOString()
        })
        .eq('id', roadmapId);

      if (error) throw error;

      setRoadmaps(prev => prev.map(r =>
        r.id === roadmapId
          ? { ...r, milestones: updatedMilestones, updated_at: new Date().toISOString() }
          : r
      ));

      toast({
        title: 'Milestone Updated',
        description: 'Milestone completion status has been updated.',
      });
    } catch (error: any) {
      console.error('Error updating milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to update milestone status.',
        variant: 'destructive',
      });
    }
  };

  const calculateProgress = (milestones: LearningMilestone[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.isCompleted).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const calculateTotalHours = (milestones: LearningMilestone[]) => {
    return milestones.reduce((sum, m) => sum + m.estimatedHours, 0);
  };

  const calculateCompletedHours = (milestones: LearningMilestone[]) => {
    return milestones
      .filter(m => m.isCompleted)
      .reduce((sum, m) => sum + m.estimatedHours, 0);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading roadmaps...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showCreateForm) {
    return (
      <LearningRoadmap
        mentorshipRequestId={mentorshipRequestId}
        candidateId={candidateId}
        selectedSkills={selectedSkills}
        onRoadmapCreated={handleRoadmapCreated}
        onClose={() => setShowCreateForm(false)}
      />
    );
  }

  if (roadmaps.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Roadmaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Learning Roadmaps Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create a structured learning path for your mentee based on their selected skills
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Create First Roadmap
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Learning Roadmaps</h3>
        <Button onClick={() => setShowCreateForm(true)} className="btn-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Create New Roadmap
        </Button>
      </div>

      {/* Roadmaps List */}
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
                  <CardTitle className="text-lg mb-2">{roadmap.title}</CardTitle>
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
                      <span className="text-gray-500">Progress:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={progress} className="flex-1 h-2" />
                        <span className="font-medium">{progress}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Milestones:</span>
                      <p className="font-medium">{roadmap.milestones.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hours:</span>
                      <p className="font-medium">{completedHours}/{totalHours}h</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRoadmap(isExpanded ? null : roadmap.id)}
                  >
                    {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRoadmap(roadmap.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Expanded Milestones */}
            {isExpanded && (
              <CardContent className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-4">Learning Milestones</h4>
                <div className="space-y-3">
                  {roadmap.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`p-3 rounded-lg border ${
                        milestone.isCompleted
                          ? 'bg-green-50 border-green-200'
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
                              milestone.isCompleted ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {milestone.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {milestone.description}
                          </p>
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
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMilestoneCompletion(roadmap.id, milestone.id)}
                          className={`ml-2 ${
                            milestone.isCompleted
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <CheckCircle className={`h-5 w-5 ${
                            milestone.isCompleted ? 'fill-current' : ''
                          }`} />
                        </Button>
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
  );
}
