import { useEffect, useMemo, useState } from "react";
import { supabase, type User } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "mentor" | "candidate";

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
}

interface UseAuthReturn {
  user: User | null;
  roles: AppRole[];
  profile: Profile | null;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAuthContext = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData.session?.user ?? null;
        if (!isMounted) return;
        setUser(currentUser ?? null);

        if (!currentUser) {
          setRoles([]);
          setProfile(null);
          return;
        }

        const [rolesRes, profileRes] = await Promise.all([
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id),
          supabase
            .from("profiles")
            .select("id,email,display_name")
            .eq("id", currentUser.id)
            .single(),
        ]);

        if (!isMounted) return;

        const roleValues: AppRole[] = (rolesRes.data || []).map((r: any) => r.role);
        setRoles(roleValues);

        setProfile(
          profileRes.data
            ? (profileRes.data as Profile)
            : { id: currentUser.id, email: currentUser.email ?? null, display_name: null }
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial load
    fetchAuthContext();

    // Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      if (!uid) {
        setUser(null);
        setRoles([]);
        setProfile(null);
        setLoading(false);
        return;
      }
      // Defer actual fetching to avoid deadlocks
      setTimeout(fetchAuthContext, 0);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const hasRole = useMemo(() => {
    return (role: AppRole) => roles.includes(role);
  }, [roles]);

  const hasAnyRole = useMemo(() => {
    return (required: AppRole[]) => required.some((r) => roles.includes(r));
  }, [roles]);

  return { user, roles, profile, loading, hasRole, hasAnyRole };
}