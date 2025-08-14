-- Check if mentorship_requests table exists and create it if it doesn't
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mentorship_requests') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.mentorship_requests (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            message TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(candidate_id, mentor_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Candidates can create mentorship requests" ON public.mentorship_requests
            FOR INSERT WITH CHECK (auth.uid() = candidate_id);
            
        CREATE POLICY "Candidates can view their own requests" ON public.mentorship_requests
            FOR SELECT USING (auth.uid() = candidate_id);
            
        CREATE POLICY "Candidates can update their own requests" ON public.mentorship_requests
            FOR UPDATE USING (auth.uid() = candidate_id);
            
        CREATE POLICY "Mentors can view requests sent to them" ON public.mentorship_requests
            FOR SELECT USING (auth.uid() = mentor_id);
            
        CREATE POLICY "Mentors can update requests sent to them" ON public.mentorship_requests
            FOR UPDATE USING (auth.uid() = mentor_id);
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id ON public.mentorship_requests(mentor_id);
        CREATE INDEX IF NOT EXISTS idx_mentorship_requests_candidate_id ON public.mentorship_requests(candidate_id);
        CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON public.mentorship_requests(status);
        
        RAISE NOTICE 'mentorship_requests table created successfully';
    ELSE
        RAISE NOTICE 'mentorship_requests table already exists';
        
        -- Check if notes column exists, add if it doesn't
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'mentorship_requests' AND column_name = 'notes') THEN
            ALTER TABLE public.mentorship_requests ADD COLUMN notes TEXT;
            RAISE NOTICE 'Added notes column to mentorship_requests table';
        END IF;
        
        -- Check if updated_at column exists, add if it doesn't
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'mentorship_requests' AND column_name = 'updated_at') THEN
            ALTER TABLE public.mentorship_requests ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column to mentorship_requests table';
        END IF;
    END IF;
END $$;

-- Create or replace the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_mentorship_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_mentorship_requests_updated_at ON public.mentorship_requests;

-- Create trigger for mentorship_requests table
CREATE TRIGGER update_mentorship_requests_updated_at 
    BEFORE UPDATE ON public.mentorship_requests 
    FOR EACH ROW EXECUTE FUNCTION update_mentorship_requests_updated_at();
