-- Add selected_skills column to mentorship_requests table
ALTER TABLE public.mentorship_requests 
ADD COLUMN IF NOT EXISTS selected_skills TEXT[] DEFAULT '{}';

-- Add a comment to explain the column
COMMENT ON COLUMN public.mentorship_requests.selected_skills IS 'Array of skills selected by the candidate when requesting mentorship';

-- Update existing records to have an empty array if they don't have selected_skills
UPDATE public.mentorship_requests 
SET selected_skills = '{}' 
WHERE selected_skills IS NULL;
