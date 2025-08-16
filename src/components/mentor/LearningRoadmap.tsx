import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  Target,
  BookOpen,
  Calendar,
  User,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface LearningRoadmapProps {
  mentorshipRequestId: string;
  candidateId: string;
  selectedSkills: string[];
  onRoadmapCreated?: (roadmap: LearningRoadmap) => void;
  onClose?: () => void;
}

export default function LearningRoadmap({
  mentorshipRequestId,
  candidateId,
  selectedSkills,
  onRoadmapCreated,
  onClose
}: LearningRoadmapProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [roadmap, setRoadmap] = useState<Partial<LearningRoadmap>>({
    title: '',
    description: '',
    skills: selectedSkills || [],
    milestones: []
  });
  const [editingMilestone, setEditingMilestone] = useState<LearningMilestone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Predefined milestone templates for common skills
  const milestoneTemplates: Record<string, LearningMilestone[]> = {
    'JavaScript': [
      { id: '1', title: 'JavaScript Fundamentals', description: 'Learn basic syntax, variables, functions, and control structures', estimatedHours: 20, order: 1, isCompleted: false },
      { id: '2', title: 'DOM Manipulation', description: 'Understand how to interact with HTML elements using JavaScript', estimatedHours: 15, order: 2, isCompleted: false },
      { id: '3', title: 'ES6+ Features', description: 'Master modern JavaScript features like arrow functions, destructuring, and modules', estimatedHours: 25, order: 3, isCompleted: false },
      { id: '4', title: 'Async Programming', description: 'Learn promises, async/await, and handling asynchronous operations', estimatedHours: 20, order: 4, isCompleted: false },
      { id: '5', title: 'Project: Interactive Web App', description: 'Build a complete web application using all learned concepts', estimatedHours: 40, order: 5, isCompleted: false }
    ],
    'React': [
      { id: '1', title: 'React Basics', description: 'Learn JSX, components, props, and state management', estimatedHours: 25, order: 1, isCompleted: false },
      { id: '2', title: 'Hooks & Lifecycle', description: 'Master useState, useEffect, and other React hooks', estimatedHours: 20, order: 2, isCompleted: false },
      { id: '3', title: 'State Management', description: 'Learn Context API and state management patterns', estimatedHours: 30, order: 3, isCompleted: false },
      { id: '4', title: 'Routing & Navigation', description: 'Implement client-side routing with React Router', estimatedHours: 15, order: 4, isCompleted: false },
      { id: '5', title: 'Project: Full-Stack App', description: 'Build a complete React application with backend integration', estimatedHours: 50, order: 5, isCompleted: false }
    ],
    'Python': [
      { id: '1', title: 'Python Basics', description: 'Learn syntax, data types, and control structures', estimatedHours: 20, order: 1, isCompleted: false },
      { id: '2', title: 'Functions & Modules', description: 'Master function definition, scope, and module organization', estimatedHours: 15, order: 2, isCompleted: false },
      { id: '3', title: 'Object-Oriented Programming', description: 'Learn classes, inheritance, and OOP principles', estimatedHours: 25, order: 3, isCompleted: false },
      { id: '4', title: 'Data Structures', description: 'Understand lists, dictionaries, sets, and algorithms', estimatedHours: 30, order: 4, isCompleted: false },
      { id: '5', title: 'Project: Data Analysis', description: 'Build a data analysis project using pandas and matplotlib', estimatedHours: 40, order: 5, isCompleted: false }
    ],
    'Data Science': [
      { id: '1', title: 'Statistics Fundamentals', description: 'Learn basic statistical concepts and probability', estimatedHours: 30, order: 1, isCompleted: false },
      { id: '2', title: 'Data Manipulation', description: 'Master pandas for data cleaning and transformation', estimatedHours: 25, order: 2, isCompleted: false },
      { id: '3', title: 'Data Visualization', description: 'Learn matplotlib, seaborn, and plotly for data visualization', estimatedHours: 20, order: 3, isCompleted: false },
      { id: '4', title: 'Machine Learning Basics', description: 'Introduction to scikit-learn and basic ML algorithms', estimatedHours: 40, order: 4, isCompleted: false },
      { id: '5', title: 'Project: Predictive Model', description: 'Build and deploy a machine learning model', estimatedHours: 50, order: 5, isCompleted: false }
    ]
  };

  const handleCreateRoadmap = () => {
    setIsCreating(true);
    setRoadmap({
      title: '',
      description: '',
      skills: selectedSkills || [],
      milestones: []
    });
  };

  const handleAddMilestone = () => {
    const newMilestone: LearningMilestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      estimatedHours: 0,
      order: (roadmap.milestones?.length || 0) + 1,
      isCompleted: false
    };
    
    setRoadmap(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), newMilestone]
    }));
  };

  const handleMilestoneChange = (id: string, field: keyof LearningMilestone, value: any) => {
    setRoadmap(prev => ({
      ...prev,
      milestones: prev.milestones?.map(milestone => 
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      ) || []
    }));
  };

  const handleRemoveMilestone = (id: string) => {
    setRoadmap(prev => ({
      ...prev,
      milestones: prev.milestones?.filter(milestone => milestone.id !== id) || []
    }));
  };

  const handleUseTemplate = (skill: string) => {
    const template = milestoneTemplates[skill];
    if (template) {
      setRoadmap(prev => ({
        ...prev,
        milestones: template.map((milestone, index) => ({
          ...milestone,
          id: Date.now().toString() + index,
          order: index + 1
        }))
      }));
      toast({
        title: 'Template Applied!',
        description: `Added ${template.length} milestones for ${skill}`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!roadmap.title || !roadmap.description || !roadmap.milestones?.length) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and add at least one milestone.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const roadmapData = {
        mentor_id: user.id,
        candidate_id: candidateId,
        mentorship_request_id: mentorshipRequestId,
        title: roadmap.title,
        description: roadmap.description,
        skills: roadmap.skills,
        milestones: roadmap.milestones,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('learning_roadmaps')
        .insert([roadmapData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Roadmap Created! 🎯',
        description: 'Your learning roadmap has been successfully created for the candidate.',
      });

      onRoadmapCreated?.(data);
      setIsCreating(false);
      setRoadmap({ title: '', description: '', skills: [], milestones: [] });
      
    } catch (error: any) {
      console.error('Error creating roadmap:', error);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create learning roadmap.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setRoadmap({ title: '', description: '', skills: [], milestones: [] });
    onClose?.();
  };

  const totalEstimatedHours = roadmap.milestones?.reduce((sum, milestone) => sum + milestone.estimatedHours, 0) || 0;

  if (!isCreating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create a Learning Path
            </h3>
            <p className="text-gray-600 mb-6">
              Design a structured learning journey for your mentee based on their selected skills
            </p>
            <Button onClick={handleCreateRoadmap} className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Create Roadmap
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-4" />
            Create Learning Roadmap
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Roadmap Title *</Label>
            <Input
              id="title"
              value={roadmap.title}
              onChange={(e) => setRoadmap(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Full-Stack Web Development Journey"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={roadmap.description}
              onChange={(e) => setRoadmap(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the overall learning objectives and what the candidate will achieve..."
              rows={3}
            />
          </div>

          {/* Selected Skills Display */}
          <div>
            <Label>Selected Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {roadmap.skills?.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone Templates */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">Quick Templates</Label>
            <Button variant="outline" size="sm" onClick={handleAddMilestone}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Milestone
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {Object.keys(milestoneTemplates).map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => handleUseTemplate(skill)}
                className="justify-start"
              >
                <Target className="h-4 w-4 mr-2" />
                Use {skill} Template
              </Button>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="border-t pt-4">
          <Label className="text-base font-medium mb-4 block">Learning Milestones</Label>
          
          {roadmap.milestones?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-2" />
              <p>No milestones added yet. Use a template or add custom milestones.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {roadmap.milestones?.map((milestone, index) => (
                <Card key={milestone.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-sm">
                        Step {milestone.order}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMilestone(milestone.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(milestone.id, 'title', e.target.value)}
                          placeholder="Milestone title"
                        />
                      </div>
                      
                      <div>
                        <Label>Estimated Hours</Label>
                        <Input
                          type="number"
                          value={milestone.estimatedHours}
                          onChange={(e) => handleMilestoneChange(milestone.id, 'estimatedHours', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Label>Description</Label>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(milestone.id, 'description', e.target.value)}
                        placeholder="Describe what the candidate will learn in this milestone..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {roadmap.milestones && roadmap.milestones.length > 0 && (
          <div className="border-t pt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Roadmap Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Milestones:</span>
                  <span className="ml-2 font-medium text-blue-900">{roadmap.milestones.length}</span>
                </div>
                <div>
                  <span className="text-blue-700">Estimated Hours:</span>
                  <span className="ml-2 font-medium text-blue-900">{totalEstimatedHours}h</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !roadmap.title || !roadmap.description || !roadmap.milestones?.length}
            className="btn-gradient"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Roadmap
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
