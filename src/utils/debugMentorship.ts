import { supabase } from "@/integrations/supabase/client";

export const debugMentorshipRequests = async (mentorId: string) => {
  try {
    console.log("🔍 Debugging mentorship requests for mentor:", mentorId);
    
    // Check if mentorship_requests table exists and has data
    const { data: allRequests, error: allRequestsError } = await supabase
      .from("mentorship_requests")
      .select("*")
      .limit(5);
    
    if (allRequestsError) {
      console.error("❌ Error fetching all requests:", allRequestsError);
      return;
    }
    
    console.log("📊 All mentorship requests (first 5):", allRequests);
    
    // Check specific mentor's requests
    const { data: mentorRequests, error: mentorRequestsError } = await supabase
      .from("mentorship_requests")
      .select("*")
      .eq("mentor_id", mentorId);
    
    if (mentorRequestsError) {
      console.error("❌ Error fetching mentor requests:", mentorRequestsError);
      return;
    }
    
    console.log("👨‍🏫 Mentor's requests:", mentorRequests);
    
    // Check table structure
    const { data: tableInfo, error: tableInfoError } = await supabase
      .rpc('get_table_info', { table_name: 'mentorship_requests' })
      .catch(() => ({ data: null, error: 'RPC function not available' }));
    
    if (tableInfoError) {
      console.log("ℹ️ Table info RPC not available, checking manually");
      
      // Try to get column info by selecting specific fields
      const { data: sampleRequest, error: sampleError } = await supabase
        .from("mentorship_requests")
        .select("id, candidate_id, mentor_id, message, status, created_at")
        .limit(1);
      
      if (sampleError) {
        console.error("❌ Error with sample request:", sampleError);
      } else {
        console.log("✅ Sample request structure:", sampleRequest);
      }
    } else {
      console.log("📋 Table structure:", tableInfo);
    }
    
  } catch (error) {
    console.error("❌ Debug error:", error);
  }
};

export const checkMentorshipRequestSchema = async () => {
  try {
    console.log("🔍 Checking mentorship_requests table schema...");
    
    // Try to insert a test record to see what fields are required
    const testData = {
      candidate_id: "00000000-0000-0000-0000-000000000000", // Dummy UUID
      mentor_id: "00000000-0000-0000-0000-000000000000", // Dummy UUID
      message: "Test message",
      status: "pending"
    };
    
    const { data, error } = await supabase
      .from("mentorship_requests")
      .insert(testData)
      .select();
    
    if (error) {
      console.log("ℹ️ Expected error (test insert):", error.message);
      console.log("📋 This shows the table structure and constraints");
    } else {
      console.log("✅ Test insert successful:", data);
      
      // Clean up test data
      await supabase
        .from("mentorship_requests")
        .delete()
        .eq("message", "Test message");
    }
    
  } catch (error) {
    console.error("❌ Schema check error:", error);
  }
};

export const listAllMentorshipRequests = async () => {
  try {
    console.log("📋 Listing all mentorship requests...");
    
    const { data, error } = await supabase
      .from("mentorship_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("❌ Error listing requests:", error);
      return;
    }
    
    console.log("📊 Total mentorship requests:", data?.length || 0);
    console.log("📋 All requests:", data);
    
    return data;
  } catch (error) {
    console.error("❌ List error:", error);
  }
};
