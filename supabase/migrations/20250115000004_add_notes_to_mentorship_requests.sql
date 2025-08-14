-- Add notes field to mentorship_requests table for mentor communication
ALTER TABLE public.mentorship_requests 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to update updated_at timestamp
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
