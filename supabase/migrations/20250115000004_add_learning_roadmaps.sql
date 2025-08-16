-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Mentors can manage their own roadmaps" ON public.learning_roadmaps;
DROP POLICY IF EXISTS "Candidates can view roadmaps created for them" ON public.learning_roadmaps;
DROP POLICY IF EXISTS "Admins can view all roadmaps" ON public.learning_roadmaps;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_learning_roadmaps_updated_at ON public.learning_roadmaps;

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.learning_roadmaps DROP CONSTRAINT IF EXISTS learning_roadmaps_mentor_id_fkey;
ALTER TABLE public.learning_roadmaps DROP CONSTRAINT IF EXISTS learning_roadmaps_candidate_id_fkey;
ALTER TABLE public.learning_roadmaps DROP CONSTRAINT IF EXISTS learning_roadmaps_mentorship_request_id_fkey;

-- Create learning_roadmaps table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.learning_roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    mentorship_request_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    skills TEXT[] DEFAULT '{}',
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.learning_roadmaps 
    ADD CONSTRAINT learning_roadmaps_mentor_id_fkey 
    FOREIGN KEY (mentor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.learning_roadmaps 
    ADD CONSTRAINT learning_roadmaps_candidate_id_fkey 
    FOREIGN KEY (candidate_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.learning_roadmaps 
    ADD CONSTRAINT learning_roadmaps_mentorship_request_id_fkey 
    FOREIGN KEY (mentorship_request_id) REFERENCES public.mentorship_requests(id) ON DELETE CASCADE;

-- Create indexes for better performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_mentor_id ON public.learning_roadmaps(mentor_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_candidate_id ON public.learning_roadmaps(candidate_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_mentorship_request_id ON public.learning_roadmaps(mentorship_request_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_created_at ON public.learning_roadmaps(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Mentors can view, create, update, and delete their own roadmaps
CREATE POLICY "Mentors can manage their own roadmaps" ON public.learning_roadmaps
    FOR ALL USING (auth.uid() = mentor_id);

-- Candidates can view roadmaps created for them
CREATE POLICY "Candidates can view roadmaps created for them" ON public.learning_roadmaps
    FOR SELECT USING (auth.uid() = candidate_id);

-- Admins can view all roadmaps
CREATE POLICY "Admins can view all roadmaps" ON public.learning_roadmaps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_learning_roadmaps_updated_at
    BEFORE UPDATE ON public.learning_roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.learning_roadmaps IS 'Learning roadmaps created by mentors for candidates';
COMMENT ON COLUMN public.learning_roadmaps.milestones IS 'JSON array of learning milestones with structure: [{id, title, description, estimatedHours, order, progress}] where progress is 0-100 percentage';
COMMENT ON COLUMN public.learning_roadmaps.skills IS 'Array of skills that the roadmap covers';
