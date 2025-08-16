import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Linkedin, 
  Github, 
  Calendar,
  Clock,
  Target,
  Code,
  Award,
  Save,
  ArrowLeft,
  Home,
  Users,
  Settings
} from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// Base profile schema
const baseProfileSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  linkedin_profile: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  github_profile: z.string().url('Please enter a valid GitHub URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
});

// Candidate-specific schema
const candidateProfileSchema = baseProfileSchema.extend({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  current_role: z.string().optional(),
  company: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  preferred_mentorship_areas: z.array(z.string()).min(1, 'Please select at least one area'),
  availability: z.array(z.string()).min(1, 'Please select at least one availability option'),
  timezone: z.string().optional(),
});

// Mentor-specific schema
const mentorProfileSchema = baseProfileSchema.extend({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  current_role: z.string().min(2, 'Current role is required'),
  company: z.string().min(2, 'Company is required'),
  experience: z.string().min(1, 'Years of experience is required'),
  expertise: z.string().min(2, 'Expertise area is required'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  hourly_rate: z.string().min(1, 'Hourly rate is required'),
  availability: z.array(z.string()).min(1, 'Please select at least one availability option'),
  introduction: z.string().max(300, 'Introduction must be less than 300 characters').optional(),
});

type BaseProfileFormData = z.infer<typeof baseProfileSchema>;
type CandidateProfileFormData = z.infer<typeof candidateProfileSchema>;
type MentorProfileFormData = z.infer<typeof mentorProfileSchema>;

const skillOptions = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'Data Science', 'Machine Learning', 'AI', 'DevOps', 'Cloud Computing', 'AWS',
  'UI/UX Design', 'Product Management', 'Agile', 'Scrum', 'Leadership',
  'Communication', 'Mentoring', 'Project Management', 'Database Design', 'API Design'
];

const goalOptions = [
  'Career Advancement', 'Skill Development', 'Industry Transition', 'Leadership Skills',
  'Technical Expertise', 'Networking', 'Personal Growth', 'Project Success',
  'Team Management', 'Innovation', 'Problem Solving', 'Communication'
];

const availabilityOptions = [
  'Weekdays', 'Weekends', 'Evenings', 'Mornings', 'Flexible', 'By Appointment'
];

const timezoneOptions = [
  'UTC-8 (PST)', 'UTC-7 (MST)', 'UTC-6 (CST)', 'UTC-5 (EST)', 'UTC+0 (GMT)',
  'UTC+1 (CET)', 'UTC+2 (EET)', 'UTC+3 (MSK)', 'UTC+5:30 (IST)', 'UTC+8 (CST)',
  'UTC+9 (JST)', 'UTC+10 (AEST)'
];

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, roles, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [mentorData, setMentorData] = useState<any>(null);

  // Determine user type
  const isCandidate = roles.includes('candidate');
  const isMentor = roles.includes('mentor');
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');

  // Use appropriate schema based on user role
  const profileSchema = isCandidate ? candidateProfileSchema : 
                       isMentor ? mentorProfileSchema : 
                       baseProfileSchema;

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: getDefaultValues(),
  });

  function getDefaultValues() {
    if (isCandidate) {
      return {
        display_name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        linkedin_profile: '',
        github_profile: '',
        portfolio_url: '',
        full_name: '',
        current_role: '',
        company: '',
        experience: '',
        education: '',
        skills: [],
        goals: [],
        preferred_mentorship_areas: [],
        availability: [],
        timezone: '',
      };
    } else if (isMentor) {
      return {
        display_name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        linkedin_profile: '',
        github_profile: '',
        portfolio_url: '',
        full_name: '',
        current_role: '',
        company: '',
        experience: '',
        expertise: '',
        skills: [],
        hourly_rate: '',
        availability: [],
        introduction: '',
      };
    } else {
      return {
        display_name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        linkedin_profile: '',
        github_profile: '',
        portfolio_url: '',
      };
    }
  }

  useEffect(() => {
    if (user && !loading) {
      loadProfileData();
    }
  }, [user, loading]);

  const loadProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      
      // Load base profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Load role-specific data
      let roleData = null;
      if (isCandidate) {
        const { data: candidateData } = await supabase
          .from('candidate_onboarding_requests')
          .select('data')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        roleData = candidateData?.data || {};
      } else if (isMentor) {
        const { data: mentorProfileData } = await supabase
          .from('mentor_onboarding_requests')
          .select('data')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        roleData = mentorProfileData?.data || {};
        setMentorData(mentorProfileData?.data || null);
      }

      // Combine profile data
      const combinedData = {
        ...profile,
        ...roleData,
      };

      setProfileData(combinedData);
      
      // Reset form with loaded data
      form.reset(combinedData);
      
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Update base profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          email: data.email,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role-specific data
      if (isCandidate) {
        const { error: candidateError } = await supabase
          .from('candidate_onboarding_requests')
          .upsert({
            user_id: user.id,
            data: {
              fullName: data.full_name,
              currentRole: data.current_role,
              company: data.company,
              experience: data.experience,
              education: data.education,
              skills: data.skills,
              goals: data.goals,
              preferredMentorshipAreas: data.preferred_mentorship_areas,
              availability: data.availability,
              timezone: data.timezone,
              bio: data.bio,
              phone: data.phone,
              location: data.location,
              linkedinProfile: data.linkedin_profile,
              githubProfile: data.github_profile,
              portfolioUrl: data.portfolio_url,
            },
            status: 'approved', // Keep existing status
          });

        if (candidateError) throw candidateError;
      } else if (isMentor) {
        const { error: mentorError } = await supabase
          .from('mentor_onboarding_requests')
          .upsert({
            user_id: user.id,
            data: {
              fullName: data.full_name,
              currentRole: data.current_role,
              company: data.company,
              experience: data.experience,
              expertise: data.expertise,
              skills: data.skills,
              hourlyRate: data.hourly_rate,
              availability: data.availability,
              introduction: data.introduction,
              bio: data.bio,
              phone: data.phone,
              location: data.location,
              linkedinProfile: data.linkedin_profile,
              githubProfile: data.github_profile,
              portfolioUrl: data.portfolio_url,
            },
            status: 'approved', // Keep existing status
          });

        if (mentorError) throw mentorError;
      }

      toast({
        title: 'Profile Updated! 🎉',
        description: 'Your profile has been successfully updated.',
      });

      // Navigate back to dashboard
      navigate(-1);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillToggle = (skill: string, field: 'skills' | 'goals' | 'preferred_mentorship_areas') => {
    const currentValues = form.getValues(field) || [];
    const newValues = currentValues.includes(skill)
      ? currentValues.filter(s => s !== skill)
      : [...currentValues, skill];
    form.setValue(field, newValues);
  };

  const handleAvailabilityToggle = (option: string) => {
    const currentValues = form.getValues('availability') || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(o => o !== option)
      : [...currentValues, option];
    form.setValue('availability', newValues);
  };

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container py-8">
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
              <Link to={isCandidate ? "/candidate/dashboard" : isMentor ? "/mentor/dashboard" : "/admin/dashboard"}>
                <Briefcase className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/mentors">
                <Users className="h-4 w-4 mr-2" />
                Find Mentors
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
              <AvatarFallback className="text-2xl">
                {profileData?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
              <p className="text-muted-foreground">
                Update your profile information and preferences
              </p>
              <div className="flex gap-2 mt-2">
                {roles.map(role => (
                  <Badge key={role} variant="secondary">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    {...form.register('display_name')}
                    placeholder="Enter your display name"
                  />
                  {form.formState.errors.display_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.display_name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="Enter your email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...form.register('location')}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...form.register('bio')}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Information */}
          {(isCandidate || isMentor) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {isCandidate ? 'Candidate' : 'Mentor'} Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      {...form.register('full_name')}
                      placeholder="Enter your full name"
                    />
                    {form.formState.errors.full_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="current_role">Current Role *</Label>
                    <Input
                      id="current_role"
                      {...form.register('current_role')}
                      placeholder={isCandidate ? "e.g., Software Engineer" : "e.g., Senior Developer"}
                    />
                    {form.formState.errors.current_role && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.current_role.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      {...form.register('company')}
                      placeholder="Enter your company name"
                    />
                    {form.formState.errors.company && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.company.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      {...form.register('experience')}
                      placeholder="e.g., 5"
                    />
                    {form.formState.errors.experience && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.experience.message}
                      </p>
                    )}
                  </div>
                </div>

                {isMentor && (
                  <div>
                    <Label htmlFor="expertise">Area of Expertise *</Label>
                    <Input
                      id="expertise"
                      {...form.register('expertise')}
                      placeholder="e.g., Full Stack Development"
                    />
                    {form.formState.errors.expertise && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.expertise.message}
                      </p>
                    )}
                  </div>
                )}

                {isMentor && (
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate (₹) *</Label>
                    <Input
                      id="hourly_rate"
                      {...form.register('hourly_rate')}
                      placeholder="e.g., 1000"
                    />
                    {form.formState.errors.hourly_rate && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.hourly_rate.message}
                      </p>
                    )}
                  </div>
                )}

                {isCandidate && (
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      {...form.register('education')}
                      placeholder="e.g., Bachelor's in Computer Science"
                    />
                  </div>
                )}

                {isMentor && (
                  <div>
                    <Label htmlFor="introduction">Introduction Message</Label>
                    <Textarea
                      id="introduction"
                      {...form.register('introduction')}
                      placeholder="A brief message to potential mentees..."
                      rows={3}
                    />
                    {form.formState.errors.introduction && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.introduction.message}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {(isCandidate || isMentor) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Select your skills *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click on skills to select/deselect them
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <Badge
                        key={skill}
                        variant={form.watch('skills')?.includes(skill) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          form.watch('skills')?.includes(skill) 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "hover:bg-gray-200"
                        }`}
                        onClick={() => handleSkillToggle(skill, 'skills')}
                      >
                        {skill}
                        {form.watch('skills')?.includes(skill) && (
                          <span className="ml-1">✓</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.skills && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.skills.message}
                    </p>
                  )}
                </div>

                {isCandidate && (
                  <>
                    <Separator className="my-6" />
                    <div className="mb-4">
                      <Label>What are your goals? *</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select your primary learning objectives
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {goalOptions.map(goal => (
                          <Badge
                            key={goal}
                            variant={form.watch('goals')?.includes(goal) ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              form.watch('goals')?.includes(goal) 
                                ? "bg-green-600 hover:bg-green-700" 
                                : "hover:bg-gray-200"
                            }`}
                            onClick={() => handleSkillToggle(goal, 'goals')}
                          >
                            {goal}
                            {form.watch('goals')?.includes(goal) && (
                              <span className="ml-1">✓</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {form.formState.errors.goals && (
                        <p className="text-sm text-red-500 mt-2">
                          {form.formState.errors.goals.message}
                        </p>
                      )}
                    </div>

                    <Separator className="my-6" />
                    <div className="mb-4">
                      <Label>Preferred Mentorship Areas *</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        What areas would you like to be mentored in?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillOptions.map(skill => (
                          <Badge
                            key={skill}
                            variant={form.watch('preferred_mentorship_areas')?.includes(skill) ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              form.watch('preferred_mentorship_areas')?.includes(skill) 
                                ? "bg-purple-600 hover:bg-purple-700" 
                                : "hover:bg-gray-200"
                            }`}
                            onClick={() => handleSkillToggle(skill, 'preferred_mentorship_areas')}
                          >
                            {skill}
                            {form.watch('preferred_mentorship_areas')?.includes(skill) && (
                              <span className="ml-1">✓</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {form.formState.errors.preferred_mentorship_areas && (
                        <p className="text-sm text-red-500 mt-2">
                          {form.formState.errors.preferred_mentorship_areas.message}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          {(isCandidate || isMentor) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>When are you available? *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select your availability options
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availabilityOptions.map(option => (
                      <Badge
                        key={option}
                        variant={form.watch('availability')?.includes(option) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          form.watch('availability')?.includes(option) 
                            ? "bg-orange-600 hover:bg-orange-700" 
                            : "hover:bg-gray-200"
                        }`}
                        onClick={() => handleAvailabilityToggle(option)}
                      >
                        {option}
                        {form.watch('availability')?.includes(option) && (
                          <span className="ml-1">✓</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.availability && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.availability.message}
                    </p>
                  )}
                </div>

                {isCandidate && (
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      {...form.register('timezone')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select your timezone</option>
                      {timezoneOptions.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profile Status - Only for Mentors */}
          {isMentor && mentorData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Profile Complete</h4>
                    <p className="text-sm text-gray-600">Your profile is ready for candidates</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Experience</h4>
                    <p className="text-sm text-gray-600">{mentorData?.experience || "Not specified"}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Hourly Rate</h4>
                    <p className="text-sm text-gray-600">₹{mentorData?.hourly_rate || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Links & Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
                  <Input
                    id="linkedin_profile"
                    {...form.register('linkedin_profile')}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {form.formState.errors.linkedin_profile && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.linkedin_profile.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="github_profile">GitHub Profile</Label>
                  <Input
                    id="github_profile"
                    {...form.register('github_profile')}
                    placeholder="https://github.com/yourusername"
                  />
                  {form.formState.errors.github_profile && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.github_profile.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio_url">Portfolio Website</Label>
                <Input
                  id="portfolio_url"
                  {...form.register('portfolio_url')}
                  placeholder="https://yourportfolio.com"
                />
                {form.formState.errors.portfolio_url && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.portfolio_url.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
