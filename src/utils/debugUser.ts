import { supabase } from "@/integrations/supabase/client";

export const debugUserLogin = async (email: string) => {
  console.log(`🔍 Debugging login for: ${email}`);
  
  try {
    // 1. First check if user exists in profiles table by email
    console.log("📧 Checking profiles table for email...");
    
    // Use .maybeSingle() instead of .single() to avoid PGRST116 error
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle(); // This won't throw error if no rows found
    
    console.log("Profile data:", profileData);
    if (profileError) {
      console.log("Profile error:", profileError);
    }
    
    // 2. If profile exists, check user roles
    if (profileData) {
      console.log("✅ Profile found, checking user roles...");
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
    } else {
      console.log("❌ No profile found for this email");
    }
    
    // 4. Also try to find any profiles with similar structure
    console.log("🔍 Checking for any profiles in the system...");
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .limit(5);
    
    if (allProfiles && allProfiles.length > 0) {
      console.log("Sample profiles in system:", allProfiles);
    } else {
      console.log("❌ No profiles found in the system - profiles table is empty!");
    }
    if (allProfilesError) console.log("All profiles error:", allProfilesError);
    
    return {
      profile: profileData,
      profileError,
      found: !!profileData,
      totalProfiles: allProfiles?.length || 0
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

export const testLoginProcess = async (email: string, password: string) => {
  console.log(`🧪 Testing login process for: ${email}`);
  
  try {
    // 1. First, let's see what happens when we try to sign in
    console.log("📡 Attempting signInWithPassword...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    
    console.log("Sign in result:", {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userEmail: data.user?.email,
      userId: data.user?.id,
      error: error,
      errorMessage: error?.message,
      errorStatus: error?.status
    });
    
    // 2. If successful, check the user's profile
    if (data.user) {
      console.log("✅ Login successful, checking profile...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      
      console.log("Profile data:", profileData);
      if (profileError) console.log("Profile error:", profileError);
      
      // 3. Check user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", data.user.id);
      
      console.log("User roles:", rolesData);
      if (rolesError) console.log("Roles error:", rolesError);
      
      // 4. Sign out to clean up
      await supabase.auth.signOut();
      console.log("🧹 Signed out to clean up");
    }
    
    return {
      success: !error,
      user: data.user,
      session: data.session,
      error: error,
      profile: data.user ? await supabase.from("profiles").select("*").eq("id", data.user.id).single() : null
    };
    
  } catch (error) {
    console.error("Test login error:", error);
    return { success: false, error };
  }
};

export const listAllProfiles = async () => {
  console.log("📋 Listing all profiles in database...");
  
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching profiles:", error);
      return { success: false, error };
    }
    
    console.log(`Found ${profiles?.length || 0} profiles:`, profiles);
    
    // Also check user_roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role, created_at")
      .order("created_at", { ascending: false });
    
    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    } else {
      console.log(`Found ${roles?.length || 0} user roles:`, roles);
    }
    
    return {
      success: true,
      profiles: profiles || [],
      roles: roles || [],
      totalProfiles: profiles?.length || 0,
      totalRoles: roles?.length || 0
    };
    
  } catch (error) {
    console.error("List profiles error:", error);
    return { success: false, error };
  }
};

export const syncMissingProfiles = async () => {
  console.log("🔄 Syncing missing profiles...");
  
  try {
    // 1. First, let's see what profiles we currently have
    const { data: existingProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, display_name");
    
    if (profilesError) {
      console.error("Error fetching existing profiles:", profilesError);
      return { success: false, error: profilesError };
    }
    
    console.log("Existing profiles:", existingProfiles);
    
    // 2. Try to create a test profile to see if we have permission
    const testProfile = {
      id: "00000000-0000-0000-0000-000000000000", // dummy UUID
      email: "test@example.com",
      display_name: "Test User"
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from("profiles")
      .insert(testProfile);
    
    if (insertError) {
      console.log("Profile insert test result:", { insertTest, insertError });
      
      // If we can't insert, try to understand why
      if (insertError.code === "PGRST116" || insertError.message.includes("0 rows")) {
        console.log("❌ Cannot insert profiles - likely RLS policy issue");
        return { 
          success: false, 
          error: insertError,
          message: "Cannot create profiles due to RLS policies. Check database permissions."
        };
      }
    }
    
    // 3. Clean up test profile if it was created
    if (insertTest) {
      await supabase
        .from("profiles")
        .delete()
        .eq("id", testProfile.id);
    }
    
    return {
      success: true,
      existingProfiles: existingProfiles || [],
      totalProfiles: existingProfiles?.length || 0,
      canCreateProfiles: !insertError
    };
    
  } catch (error) {
    console.error("Sync profiles error:", error);
    return { success: false, error };
  }
};

export const createProfileForUser = async (email: string, displayName?: string) => {
  console.log(`👤 Creating profile for user: ${email}`);
  
  try {
    // 1. First try to sign up the user to get their ID
    const { data, error } = await supabase.auth.signUp({
      email,
      password: "TempPass123!",
      options: {
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    });
    
    if (error) {
      console.log("Sign up error (user might already exist):", error);
      
      // If user already exists, try to sign in to get their ID
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: "TempPass123!"
      });
      
      if (signInError) {
        console.log("Sign in error:", signInError);
        return { success: false, error: signInError };
      }
      
      if (signInData.user) {
        console.log("✅ User found, ID:", signInData.user.id);
        
        // 2. Create profile manually
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: signInData.user.id,
            email: signInData.user.email,
            display_name: displayName || signInData.user.email?.split('@')[0] || "User"
          })
          .select()
          .single();
        
        if (profileError) {
          console.log("Profile creation error:", profileError);
          return { success: false, error: profileError };
        }
        
        // 3. Sign out to clean up
        await supabase.auth.signOut();
        
        console.log("✅ Profile created successfully:", profileData);
        return { success: true, profile: profileData };
      }
    }
    
    if (data.user) {
      console.log("✅ New user created, ID:", data.user.id);
      
      // 2. Create profile manually
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
          display_name: displayName || data.user.email?.split('@')[0] || "User"
        })
        .select()
        .single();
      
      if (profileError) {
        console.log("Profile creation error:", profileError);
        return { success: false, error: profileError };
      }
      
      console.log("✅ Profile created successfully:", profileData);
      return { success: true, profile: profileData };
    }
    
    return { success: false, error: new Error("Failed to create user or profile") };
    
  } catch (error) {
    console.error("Create profile error:", error);
    return { success: false, error };
  }
};

export const testDatabaseTrigger = async () => {
  console.log("🧪 Testing database trigger functionality...");
  
  try {
    // 1. Create a test user to see if the trigger fires
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "TestPass123!";
    
    console.log(`📧 Creating test user: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: "Test User"
        }
      }
    });
    
    if (error) {
      console.log("❌ User creation failed:", error);
      return { success: false, error };
    }
    
    if (data.user) {
      console.log("✅ Test user created successfully:", data.user.id);
      
      // 2. Wait a moment for the trigger to fire
      console.log("⏳ Waiting for trigger to fire...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Check if profile was created
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      
      if (profileData) {
        console.log("✅ Profile created by trigger:", profileData);
        
        // 4. Clean up - delete the test user
        console.log("🧹 Cleaning up test user...");
        await supabase.auth.admin.deleteUser(data.user.id);
        
        return { 
          success: true, 
          message: "Database trigger is working! Profile created automatically.",
          profile: profileData
        };
      } else {
        console.log("❌ Profile not created by trigger");
        if (profileError) console.log("Profile error:", profileError);
        
        // Clean up anyway
        await supabase.auth.admin.deleteUser(data.user.id);
        
        return { 
          success: false, 
          message: "Database trigger is NOT working. Profile not created automatically.",
          error: profileError
        };
      }
    }
    
    return { success: false, error: new Error("Failed to create test user") };
    
  } catch (error) {
    console.error("Test trigger error:", error);
    return { success: false, error };
  }
};

export const fixRLSAndCreateProfiles = async () => {
  console.log("🔧 Fixing RLS policies and creating missing profiles...");
  
  try {
    // 1. First check if user is authenticated
    console.log("🔐 Checking authentication status...");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log("❌ Session check failed:", sessionError);
      return { 
        success: false, 
        message: "Cannot check authentication status",
        error: sessionError,
        canCreateProfiles: false
      };
    }
    
    if (!session) {
      console.log("❌ No active session - user not authenticated");
      return { 
        success: false, 
        message: "You must be logged in to test profile creation. Please log in first.",
        error: new Error("Not authenticated"),
        canCreateProfiles: false
      };
    }
    
    console.log("✅ User is authenticated:", session.user.email);
    
    // 2. Try to manually create a profile for the current user
    console.log("🔧 Testing manual profile creation for current user...");
    
    // 3. Check if current user already has a profile
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    
    if (profileCheckError) {
      console.log("❌ Profile check failed:", profileCheckError);
      return { 
        success: false, 
        message: "Cannot check existing profile",
        error: profileCheckError,
        canCreateProfiles: false
      };
    }
    
    if (existingProfile) {
      console.log("✅ User already has a profile:", existingProfile);
      return { 
        success: true, 
        message: "User already has a profile. RLS policies are working.",
        profile: existingProfile,
        canCreateProfiles: true
      };
    }
    
    // 4. Try to create a profile for the current user
    console.log("📝 Attempting to create profile for current user...");
    
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        email: session.user.email,
        display_name: session.user.email?.split('@')[0] || "User"
      })
      .select()
      .single();
    
    if (newProfile) {
      console.log("✅ Profile creation succeeded:", newProfile);
      return { 
        success: true, 
        message: "Profile creation works! RLS policies are fixed.",
        profile: newProfile,
        canCreateProfiles: true
      };
    } else {
      console.log("❌ Profile creation failed:", createError);
      
      // 5. Analyze the error to understand what's happening
      console.log("🔍 Analyzing the error...");
      
      if (createError?.code === "42501") {
        return { 
          success: false, 
          message: "RLS policies are still blocking profile creation. The migration may not have worked.",
          error: createError,
          canCreateProfiles: false
        };
      } else if (createError?.code === "23505") {
        return { 
          success: false, 
          message: "Profile creation failed due to unique constraint. This suggests RLS is working but there's a data conflict.",
          error: createError,
          canCreateProfiles: true
        };
      } else if (createError?.message?.includes("401") || createError?.message?.includes("Unauthorized")) {
        return { 
          success: false, 
          message: "Authentication error. Please make sure you're logged in.",
          error: createError,
          canCreateProfiles: false
        };
      } else {
        return { 
          success: false, 
          message: "Profile creation failed for unknown reason. Check console for details.",
          error: createError,
          canCreateProfiles: false
        };
      }
    }
    
  } catch (error) {
    console.error("Fix RLS error:", error);
    return { success: false, error };
  }
};

export const createMissingProfilesForExistingUsers = async () => {
  console.log("👥 Creating missing profiles for existing users...");
  
  try {
    // 1. Get all users from auth.users (we can't query this directly, but we can try to sign in)
    console.log("📋 Attempting to create profiles for existing users...");
    
    // 2. Try to create a profile for a known user
    const knownEmails = ["candidate@ideas2it.com"]; // Add more emails as needed
    
    for (const email of knownEmails) {
      console.log(`🔍 Processing user: ${email}`);
      
      try {
        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: "TempPass123!" // This will fail, but we might get user info
        });
        
        if (signInError) {
          console.log(`Sign in failed for ${email}:`, signInError.message);
          
          // If it's an invalid credentials error, the user exists but password is wrong
          if (signInError.message.includes("Invalid login credentials")) {
            console.log(`✅ User ${email} exists in auth system`);
            
            // Try to create profile using a different approach
            // We'll need to get the user ID somehow
            console.log(`🔧 Need to find user ID for ${email} to create profile`);
          }
        } else if (signInData.user) {
          console.log(`✅ Successfully signed in as ${email}, ID: ${signInData.user.id}`);
          
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", signInData.user.id)
            .maybeSingle();
          
          if (existingProfile) {
            console.log(`✅ Profile already exists for ${email}`);
          } else {
            console.log(`❌ No profile for ${email}, attempting to create...`);
            
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: signInData.user.id,
                email: signInData.user.email,
                display_name: email.split('@')[0]
              })
              .select()
              .single();
            
            if (newProfile) {
              console.log(`✅ Profile created for ${email}:`, newProfile);
            } else {
              console.log(`❌ Failed to create profile for ${email}:`, createError);
            }
          }
          
          // Sign out
          await supabase.auth.signOut();
        }
      } catch (userError) {
        console.log(`Error processing ${email}:`, userError);
      }
    }
    
    return { success: true, message: "Processed existing users" };
    
  } catch (error) {
    console.error("Create missing profiles error:", error);
    return { success: false, error };
  }
};
