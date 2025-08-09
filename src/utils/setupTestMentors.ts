import { supabase } from "@/integrations/supabase/client";

export const setupTestMentors = async () => {
  try {
    console.log("Setting up test mentors...");

    // Get current user to make them a test mentor
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    console.log("Current user:", user.id, user.email);

    // 1. Add mentor role to current user
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, role: "mentor" })
      .select();

    if (roleError) {
      console.error("Error adding mentor role:", roleError);
    } else {
      console.log("Added mentor role:", roleData);
    }

    // 2. Create an approved mentor onboarding request
    const testMentorData = {
      fullName: user.email?.split('@')[0] || "Test Mentor",
      currentRole: "Senior Software Engineer",
      company: "Tech Corp",
      bio: "Experienced software engineer with expertise in full-stack development and mentoring.",
      skills: ["JavaScript", "React", "Node.js", "Python", "System Design"],
      hourlyRate: "2500",
      availability: ["Weekdays Morning", "Weekends"],
      linkedinProfile: "https://linkedin.com/in/testmentor",
      experience: "8",
      introduction: "I'm passionate about helping developers grow their careers and technical skills."
    };

    const { data: onboardingData, error: onboardingError } = await supabase
      .from("mentor_onboarding_requests")
      .upsert({
        user_id: user.id,
        data: testMentorData,
        status: "approved"
      })
      .select();

    if (onboardingError) {
      console.error("Error creating mentor onboarding request:", onboardingError);
    } else {
      console.log("Created mentor onboarding request:", onboardingData);
    }

    // 3. Update or create profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        display_name: testMentorData.fullName
      })
      .select();

    if (profileError) {
      console.error("Error updating profile:", profileError);
    } else {
      console.log("Updated profile:", profileData);
    }

    console.log("✅ Test mentor setup complete!");
    console.log("You should now see yourself as a mentor when you search.");

  } catch (error) {
    console.error("Error setting up test mentors:", error);
  }
};

// Function to check current database state
export const checkDatabaseState = async () => {
  try {
    console.log("Checking database state...");

    // Check user roles
    const { data: roles } = await supabase.from("user_roles").select("*");
    console.log("All user roles:", roles);

    // Check mentor onboarding requests
    const { data: mentorRequests } = await supabase
      .from("mentor_onboarding_requests")
      .select("*");
    console.log("All mentor onboarding requests:", mentorRequests);

    // Check profiles
    const { data: profiles } = await supabase.from("profiles").select("*");
    console.log("All profiles:", profiles);

  } catch (error) {
    console.error("Error checking database state:", error);
  }
};
