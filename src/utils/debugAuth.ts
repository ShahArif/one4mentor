import { supabase } from "@/integrations/supabase/client";

export const debugLogin = async (email: string, password: string) => {
  console.log("🔍 Debug Login Starting...");
  console.log("Email:", email);
  console.log("Password length:", password?.length);
  console.log("Supabase URL:", supabase.supabaseUrl);
  
  // Test basic connectivity
  try {
    console.log("📡 Testing Supabase connectivity...");
    const { data: healthCheck, error: healthError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    
    if (healthError) {
      console.warn("Health check warning:", healthError);
    } else {
      console.log("✅ Supabase connection OK");
    }
  } catch (error) {
    console.error("❌ Supabase connection failed:", error);
  }

  // Validate input parameters
  if (!email || !email.includes("@")) {
    console.error("❌ Invalid email format:", email);
    return { success: false, error: "Invalid email format" };
  }

  if (!password || password.length < 6) {
    console.error("❌ Invalid password (too short):", password?.length);
    return { success: false, error: "Password too short" };
  }

  // Test the actual login
  try {
    console.log("🔐 Attempting login...");
    
    // First, ensure we're signed out
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    console.log("Login response:", {
      success: !!data.user,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        created_at: data.user.created_at
      } : null,
      session: data.session ? {
        access_token: data.session.access_token ? "present" : "missing",
        refresh_token: data.session.refresh_token ? "present" : "missing",
        expires_at: data.session.expires_at
      } : null,
      error: error ? {
        message: error.message,
        status: error.status,
        details: error
      } : null
    });

    if (error) {
      console.error("❌ Login failed:", error);
      return { success: false, error: error.message, details: error };
    }

    if (!data.user) {
      console.error("❌ No user data returned");
      return { success: false, error: "No user data returned" };
    }

    console.log("✅ Login successful");
    return { success: true, user: data.user, session: data.session };

  } catch (error) {
    console.error("❌ Login exception:", error);
    return { success: false, error: "Login exception", details: error };
  }
};

export const testSpecificUser = async (email: string) => {
  console.log(`🔍 Testing specific user: ${email}`);
  
  try {
    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    console.log("Profile lookup:", { profile, profileError });

    if (!profile) {
      console.log("❌ User not found in profiles table");
      return { exists: false, reason: "No profile found" };
    }

    // Check user roles
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", profile.id);

    console.log("User roles:", { roles, roleError });

    // Check onboarding status
    const { data: candidateRequest, error: candidateError } = await supabase
      .from("candidate_onboarding_requests")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("Candidate onboarding:", { candidateRequest, candidateError });

    return {
      exists: true,
      profile,
      roles: roles || [],
      candidateRequest: candidateRequest?.[0] || null,
      isCandidate: roles?.some(r => r.role === "candidate") || false
    };

  } catch (error) {
    console.error("User test error:", error);
    return { exists: false, error };
  }
};

export const resetAndCreateCandidate = async (email: string, password: string = "TempPass123!") => {
  console.log(`🔧 Resetting and creating candidate: ${email}`);
  
  try {
    // Sign up the user (this might fail if they already exist)
    console.log("Creating auth user...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: email.split('@')[0]
        }
      }
    });

    let userId = authData?.user?.id;

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("User already exists, trying to find existing user...");
        
        // Try to find existing user
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();
        
        if (profile) {
          userId = profile.id;
          console.log("Found existing user ID:", userId);
        } else {
          throw new Error("User exists but can't find profile");
        }
      } else {
        throw authError;
      }
    }

    if (!userId) {
      throw new Error("No user ID available");
    }

    console.log("User ID:", userId);

    // Ensure profile exists
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: email,
        display_name: email.split('@')[0]
      });

    if (profileError) {
      console.warn("Profile upsert warning:", profileError);
    }

    // Add candidate role
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: "candidate"
      });

    if (roleError) {
      console.warn("Role upsert warning:", roleError);
    }

    // Create approved onboarding request
    const { error: onboardingError } = await supabase
      .from("candidate_onboarding_requests")
      .upsert({
        user_id: userId,
        data: {
          fullName: email.split('@')[0],
          experience: "5+ years",
          goals: "Professional development",
          skills: ["Leadership", "Technology"],
          bio: "Automatically created candidate profile"
        },
        status: "approved"
      });

    if (onboardingError) {
      console.warn("Onboarding upsert warning:", onboardingError);
    }

    console.log("✅ Candidate setup complete");
    return {
      success: true,
      userId,
      password,
      message: `Candidate ${email} created/updated with password: ${password}`
    };

  } catch (error) {
    console.error("Reset and create error:", error);
    return { success: false, error };
  }
};
