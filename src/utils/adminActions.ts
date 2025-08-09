import { supabase } from "@/integrations/supabase/client";

export const createCandidateUser = async (email: string, password: string = "TempPass123!") => {
  console.log(`🔧 Admin: Creating candidate user ${email}`);
  
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: email.split('@')[0]
        }
      }
    });

    if (authError) {
      console.error("Auth creation failed:", authError);
      return { success: false, error: authError };
    }

    if (!authData.user) {
      console.error("No user data returned");
      return { success: false, error: new Error("No user data returned") };
    }

    const userId = authData.user.id;
    console.log("✅ Auth user created:", userId);

    // 2. Create profile entry (this might be auto-created by trigger)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: email,
        display_name: email.split('@')[0],
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn("Profile creation warning:", profileError);
    } else {
      console.log("✅ Profile created");
    }

    // 3. Add candidate role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "candidate"
      });

    if (roleError) {
      console.error("Role assignment failed:", roleError);
      return { success: false, error: roleError };
    }

    console.log("✅ Candidate role assigned");

    // 4. Create approved candidate onboarding request
    const { error: onboardingError } = await supabase
      .from("candidate_onboarding_requests")
      .insert({
        user_id: userId,
        data: {
          fullName: email.split('@')[0],
          currentRole: "Professional",
          company: "Ideas2IT",
          experience: "5+ years",
          goals: "Professional development",
          skills: ["Leadership", "Technology"],
          bio: "Automatically created candidate profile"
        },
        status: "approved"
      });

    if (onboardingError) {
      console.error("Onboarding request creation failed:", onboardingError);
      return { success: false, error: onboardingError };
    }

    console.log("✅ Approved onboarding request created");

    return {
      success: true,
      user: authData.user,
      password,
      message: `User ${email} created successfully with password: ${password}`
    };

  } catch (error) {
    console.error("Create candidate user error:", error);
    return { success: false, error };
  }
};

export const checkUserComplete = async (email: string) => {
  console.log(`🔍 Admin: Checking complete user setup for ${email}`);
  
  try {
    // Find user by email in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.log("❌ No profile found");
      return { exists: false, error: profileError };
    }

    console.log("✅ Profile found:", profile);

    // Check roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", profile.id);

    console.log("Roles:", roles);

    // Check onboarding requests
    const { data: candidateRequests, error: candidateError } = await supabase
      .from("candidate_onboarding_requests")
      .select("*")
      .eq("user_id", profile.id);

    console.log("Candidate requests:", candidateRequests);

    const { data: mentorRequests, error: mentorError } = await supabase
      .from("mentor_onboarding_requests")
      .select("*")
      .eq("user_id", profile.id);

    console.log("Mentor requests:", mentorRequests);

    return {
      exists: true,
      profile,
      roles: roles || [],
      candidateRequests: candidateRequests || [],
      mentorRequests: mentorRequests || [],
      isCandidate: roles?.some(r => r.role === "candidate") || false,
      isMentor: roles?.some(r => r.role === "mentor") || false,
      hasApprovedCandidateRequest: candidateRequests?.some(r => r.status === "approved") || false,
      hasApprovedMentorRequest: mentorRequests?.some(r => r.status === "approved") || false
    };

  } catch (error) {
    console.error("Check user complete error:", error);
    return { exists: false, error };
  }
};
