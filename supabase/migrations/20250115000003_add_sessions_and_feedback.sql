-- Add sessions table for mentorship sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentorship_request_id UUID REFERENCES public.mentorship_requests(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('video', 'audio', 'in-person')),
    duration_minutes INTEGER NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    location TEXT,
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add feedback table for session feedback
CREATE TABLE IF NOT EXISTS public.session_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add learning progress tracking table
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    progress_percentage INTEGER NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- Add RLS policies for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own sessions
CREATE POLICY "Candidates can view their own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = candidate_id);

-- Candidates can create sessions
CREATE POLICY "Candidates can create sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Candidates can update their own sessions
CREATE POLICY "Candidates can update their own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = candidate_id);

-- Mentors can view sessions they're involved in
CREATE POLICY "Mentors can view their sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = mentor_id);

-- Mentors can update sessions they're involved in
CREATE POLICY "Mentors can update their sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = mentor_id);

-- Add RLS policies for session feedback
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own feedback
CREATE POLICY "Candidates can view their own feedback" ON public.session_feedback
    FOR SELECT USING (auth.uid() = candidate_id);

-- Candidates can create feedback for their sessions
CREATE POLICY "Candidates can create feedback" ON public.session_feedback
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Mentors can view feedback for their sessions
CREATE POLICY "Mentors can view feedback for their sessions" ON public.session_feedback
    FOR SELECT USING (auth.uid() = mentor_id);

-- Add RLS policies for learning progress
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own learning progress
CREATE POLICY "Users can view their own learning progress" ON public.learning_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own learning progress
CREATE POLICY "Users can create their own learning progress" ON public.learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own learning progress
CREATE POLICY "Users can update their own learning progress" ON public.learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_candidate_id ON public.sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON public.sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_date ON public.sessions(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_session_feedback_session_id ON public.session_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_candidate_id ON public.session_feedback(candidate_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_mentor_id ON public.session_feedback(mentor_id);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_skill_name ON public.learning_progress(skill_name);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON public.sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
