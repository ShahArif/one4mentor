import { supabase } from "@/integrations/supabase/client";

export interface LearningProgress {
  skill_name: string;
  progress_percentage: number;
}

export const updateLearningProgress = async (
  userId: string, 
  skillName: string, 
  progress: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("learning_progress")
      .upsert({
        user_id: userId,
        skill_name: skillName,
        progress_percentage: Math.max(0, Math.min(100, progress)), // Ensure progress is between 0-100
        last_updated: new Date().toISOString()
      });

    if (error) {
      console.error("Error updating learning progress:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating learning progress:", error);
    return { success: false, error: error.message };
  }
};

export const getLearningProgress = async (userId: string): Promise<LearningProgress[]> => {
  try {
    const { data, error } = await supabase
      .from("learning_progress")
      .select("*")
      .eq("user_id", userId)
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("Error fetching learning progress:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching learning progress:", error);
    return [];
  }
};

export const addNewSkill = async (
  userId: string, 
  skillName: string, 
  initialProgress: number = 0
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("learning_progress")
      .insert({
        user_id: userId,
        skill_name: skillName,
        progress_percentage: Math.max(0, Math.min(100, initialProgress)),
        last_updated: new Date().toISOString()
      });

    if (error) {
      console.error("Error adding new skill:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error adding new skill:", error);
    return { success: false, error: error.message };
  }
};

export const removeSkill = async (
  userId: string, 
  skillName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("learning_progress")
      .delete()
      .eq("user_id", userId)
      .eq("skill_name", skillName);

    if (error) {
      console.error("Error removing skill:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error removing skill:", error);
    return { success: false, error: error.message };
  }
};
