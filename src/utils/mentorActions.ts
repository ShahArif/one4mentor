import { supabase } from "@/integrations/supabase/client";

export interface MessageToCandidate {
  mentor_id: string;
  candidate_id: string;
  message: string;
  mentorship_request_id?: string;
}

export const sendMessageToCandidate = async (
  messageData: MessageToCandidate
): Promise<{ success: boolean; error?: string }> => {
  try {
    // For now, we'll just log the message
    // In a real implementation, you'd have a messages table or use a messaging service
    console.log("Message to candidate:", messageData);
    
    // You could also update the mentorship request with a note
    if (messageData.mentorship_request_id) {
      const { error } = await supabase
        .from("mentorship_requests")
        .update({ 
          notes: messageData.message,
          updated_at: new Date().toISOString()
        })
        .eq("id", messageData.mentorship_request_id);

      if (error) {
        console.error("Error updating mentorship request:", error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending message to candidate:", error);
    return { success: false, error: error.message };
  }
};

export const getMentorshipRequestDetails = async (
  requestId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("mentorship_requests")
      .select(`
        *,
        candidate:profiles!mentorship_requests_candidate_id_fkey(
          email,
          display_name
        ),
        candidate_data:candidate_onboarding_requests!mentorship_requests_candidate_id_fkey(
          data
        )
      `)
      .eq("id", requestId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching mentorship request details:", error);
    return { success: false, error: error.message };
  }
};

export const updateMentorshipRequestStatus = async (
  requestId: string,
  status: "accepted" | "rejected" | "cancelled",
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("mentorship_requests")
      .update({ 
        status,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating mentorship request status:", error);
    return { success: false, error: error.message };
  }
};
