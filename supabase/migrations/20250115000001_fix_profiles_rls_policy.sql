-- Fix missing RLS policy for profiles table
-- The profiles table is missing an INSERT policy, which prevents profile creation

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Trigger function can create profiles" on public.profiles;
drop policy if exists "Service role can manage all profiles" on public.profiles;

-- Add INSERT policy for profiles table
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- Also add a policy to allow the trigger function to create profiles
create policy "Trigger function can create profiles"
  on public.profiles
  for insert
  to authenticated
  with check (true);

-- Alternative: Allow service role to bypass RLS for profile creation
-- This is needed for the trigger function to work properly
create policy "Service role can manage all profiles"
  on public.profiles
  for all
  to service_role
  using (true)
  with check (true);

-- Drop and recreate the trigger to ensure it's working
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Ensure the trigger function exists and is correct
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;
