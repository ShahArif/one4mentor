import { supabase } from "@/integrations/supabase/client";

export const debugUserLogin = async (email: string) => {
  console.log(`🔍 Debugging login for: ${email}`);
  
  try {
    // 1. Check if user exists in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();
    
    console.log("Profile data:", profileData);
    if (profileError) console.log("Profile error:", profileError);
    
    // 2. Check user roles if profile exists
    if (profileData) {
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", profileData.id);
      
      console.log("User roles:", rolesData);
      if (rolesError) console.log("Roles error:", rolesError);
      
      // 3. Check onboarding requests
      const { data: candidateRequests, error: candidateError } = await supabase
        .from("candidate_onboarding_requests")
        .select("*")
        .eq("user_id", profileData.id);
      
      console.log("Candidate onboarding requests:", candidateRequests);
      if (candidateError) console.log("Candidate error:", candidateError);
      
      const { data: mentorRequests, error: mentorError } = await supabase
        .from("mentor_onboarding_requests")
        .select("*")
        .eq("user_id", profileData.id);
      
      console.log("Mentor onboarding requests:", mentorRequests);
      if (mentorError) console.log("Mentor error:", mentorError);
    }
    
    return {
      profile: profileData,
      profileError,
      found: !!profileData
    };
    
  } catch (error) {
    console.error("Debug error:", error);
    return { error, found: false };
  }
};

export const testPasswordReset = async (email: string) => {
  console.log(`🔄 Testing password reset for: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    console.log("Password reset result:", { data, error });
    return { success: !error, error };
    
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error };
  }
};

export const createUserIfNotExists = async (email: string, password: string = "TempPass123!") => {
  console.log(`👤 Creating user: ${email}`);
  
  try {
    // Try to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: email.split('@')[0]
        }
      }
    });
    
    console.log("Sign up result:", { data, error });
    
    if (data.user && !error) {
      console.log("✅ User created successfully");
      return { success: true, user: data.user, password };
    } else {
      console.log("❌ Failed to create user:", error);
      return { success: false, error };
    }
    
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error };
  }
};
