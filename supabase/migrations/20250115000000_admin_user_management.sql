-- Migration to enable admin user management functionality
-- This adds policies for super_admin to manage all user profiles

-- Add policy for super_admin to view all profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Add policy for super_admin to insert profiles
DROP POLICY IF EXISTS "Super admins can create profiles" ON public.profiles;
CREATE POLICY "Super admins can create profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Add policy for super_admin to update all profiles
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Add policy for super_admin to delete profiles
DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;
CREATE POLICY "Super admins can delete profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Function to create a new user (admin functionality)
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email text,
  user_password text,
  user_display_name text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Check if caller is super_admin
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Access denied. Super admin privileges required.';
  END IF;

  -- This function would need to use Supabase admin API
  -- For now, we'll return an error indicating manual creation needed
  RAISE EXCEPTION 'User creation must be done through Supabase Auth API. Please use the admin dashboard UI.';
  
  RETURN json_build_object('success', false, 'message', 'Not implemented');
END;
$$;

-- Function to delete a user (admin functionality)
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is super_admin
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Access denied. Super admin privileges required.';
  END IF;

  -- Prevent self-deletion
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;

  -- Delete user roles first (cascading will handle the rest)
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete profile (this will cascade to other tables)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Note: Actual auth.users deletion would need to be done via Supabase Admin API
  -- This function only cleans up our application data
  
  RETURN json_build_object(
    'success', true, 
    'message', 'User data deleted. Auth user deletion requires admin API.'
  );
END;
$$;