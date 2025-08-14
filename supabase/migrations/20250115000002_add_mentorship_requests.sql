-- Add mentorship requests table
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(candidate_id, mentor_id) -- Prevent duplicate requests
);

-- Add RLS policies for mentorship requests
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Candidates can create requests
CREATE POLICY "Candidates can create mentorship requests" ON public.mentorship_requests
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Candidates can view their own requests
CREATE POLICY "Candidates can view their own requests" ON public.mentorship_requests
    FOR SELECT USING (auth.uid() = candidate_id);

-- Candidates can update their own requests
CREATE POLICY "Candidates can update their own requests" ON public.mentorship_requests
    FOR UPDATE USING (auth.uid() = candidate_id);

-- Mentors can view requests sent to them
CREATE POLICY "Mentors can view requests sent to them" ON public.mentorship_requests
    FOR SELECT USING (auth.uid() = mentor_id);

-- Mentors can update requests sent to them (accept/reject)
CREATE POLICY "Mentors can update requests sent to them" ON public.mentorship_requests
    FOR UPDATE USING (auth.uid() = mentor_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id ON public.mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_candidate_id ON public.mentorship_requests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON public.mentorship_requests(status);
