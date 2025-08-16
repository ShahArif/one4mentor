-- Update existing learning roadmaps to use progress percentage instead of isCompleted
-- This migration converts the old milestone structure to the new one

-- Function to update milestones in JSONB arrays
CREATE OR REPLACE FUNCTION update_milestone_structure()
RETURNS void AS $$
DECLARE
    roadmap_record RECORD;
    updated_milestones JSONB;
    milestone JSONB;
    new_milestones JSONB := '[]'::JSONB;
BEGIN
    -- Loop through all learning roadmaps
    FOR roadmap_record IN SELECT id, milestones FROM learning_roadmaps LOOP
        new_milestones := '[]'::JSONB;
        
        -- Process each milestone in the array
        FOR milestone IN SELECT * FROM jsonb_array_elements(roadmap_record.milestones)
        LOOP
            -- Convert isCompleted to progress
            IF milestone->>'isCompleted' = 'true' THEN
                milestone := jsonb_set(milestone, '{progress}', '100');
            ELSIF milestone->>'isCompleted' = 'false' THEN
                milestone := jsonb_set(milestone, '{progress}', '0');
            ELSE
                -- If no isCompleted field, default to 0
                milestone := jsonb_set(milestone, '{progress}', '0');
            END IF;
            
            -- Remove the old isCompleted field
            milestone := milestone - 'isCompleted';
            
            -- Add to new milestones array
            new_milestones := new_milestones || milestone;
        END LOOP;
        
        -- Update the roadmap with new milestone structure
        UPDATE learning_roadmaps 
        SET milestones = new_milestones 
        WHERE id = roadmap_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the update
SELECT update_milestone_structure();

-- Drop the function
DROP FUNCTION update_milestone_structure();

-- Add comment to document the new structure
COMMENT ON COLUMN learning_roadmaps.milestones IS 'JSON array of learning milestones with structure: [{id, title, description, estimatedHours, order, progress}] where progress is 0-100 percentage';
