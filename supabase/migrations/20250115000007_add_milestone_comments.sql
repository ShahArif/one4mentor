-- Create milestone_comments table
CREATE TABLE IF NOT EXISTS milestone_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID NOT NULL REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
    milestone_index INTEGER NOT NULL, -- Index of milestone in the JSONB array
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_milestone_comments_roadmap_id ON milestone_comments(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_milestone_comments_user_id ON milestone_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_comments_milestone_index ON milestone_comments(milestone_index);

-- Enable RLS
ALTER TABLE milestone_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view comments on milestones they have access to
CREATE POLICY "Users can view milestone comments" ON milestone_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM learning_roadmaps lr
            WHERE lr.id = milestone_comments.roadmap_id
            AND (lr.candidate_id = auth.uid() OR lr.mentor_id = auth.uid())
        )
    );

-- Users can insert comments on milestones they have access to
CREATE POLICY "Users can insert milestone comments" ON milestone_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM learning_roadmaps lr
            WHERE lr.id = milestone_comments.roadmap_id
            AND (lr.candidate_id = auth.uid() OR lr.mentor_id = auth.uid())
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update own milestone comments" ON milestone_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own milestone comments" ON milestone_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_milestone_comments_updated_at 
    BEFORE UPDATE ON milestone_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
