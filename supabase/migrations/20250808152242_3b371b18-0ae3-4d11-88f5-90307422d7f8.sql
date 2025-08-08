-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin','admin','mentor','candidate');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE public.request_status AS ENUM ('pending','approved','rejected');
  END IF;
END $$;

-- user_roles table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- helper function
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- RLS policies for user_roles
DROP POLICY IF EXISTS "Users can read their roles" ON public.user_roles;
CREATE POLICY "Users can read their roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- recreate trigger for profiles
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_profiles_updated_at') THEN
    DROP TRIGGER tr_profiles_updated_at ON public.profiles;
  END IF;
END $$;
CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- insert profile on signup trigger
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

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- mentor onboarding
create table if not exists public.mentor_onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mentor_onboarding_requests enable row level security;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_mentor_onboarding_updated_at') THEN
    DROP TRIGGER tr_mentor_onboarding_updated_at ON public.mentor_onboarding_requests;
  END IF;
END $$;
CREATE TRIGGER tr_mentor_onboarding_updated_at
BEFORE UPDATE ON public.mentor_onboarding_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- candidate onboarding
create table if not exists public.candidate_onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_onboarding_requests enable row level security;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_candidate_onboarding_updated_at') THEN
    DROP TRIGGER tr_candidate_onboarding_updated_at ON public.candidate_onboarding_requests;
  END IF;
END $$;
CREATE TRIGGER tr_candidate_onboarding_updated_at
BEFORE UPDATE ON public.candidate_onboarding_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies for onboarding tables
DROP POLICY IF EXISTS "Users can create their mentor requests" ON public.mentor_onboarding_requests;
CREATE POLICY "Users can create their mentor requests"
  ON public.mentor_onboarding_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their mentor requests" ON public.mentor_onboarding_requests;
CREATE POLICY "Users can view their mentor requests"
  ON public.mentor_onboarding_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their pending mentor requests" ON public.mentor_onboarding_requests;
CREATE POLICY "Users can update their pending mentor requests"
  ON public.mentor_onboarding_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Super admins manage all mentor requests" ON public.mentor_onboarding_requests;
CREATE POLICY "Super admins manage all mentor requests"
  ON public.mentor_onboarding_requests
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "Users can create their candidate requests" ON public.candidate_onboarding_requests;
CREATE POLICY "Users can create their candidate requests"
  ON public.candidate_onboarding_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their candidate requests" ON public.candidate_onboarding_requests;
CREATE POLICY "Users can view their candidate requests"
  ON public.candidate_onboarding_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their pending candidate requests" ON public.candidate_onboarding_requests;
CREATE POLICY "Users can update their pending candidate requests"
  ON public.candidate_onboarding_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Super admins manage all candidate requests" ON public.candidate_onboarding_requests;
CREATE POLICY "Super admins manage all candidate requests"
  ON public.candidate_onboarding_requests
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Auto-grant super admin
create or replace function public.auto_grant_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.email) = 'a@b.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'super_admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_auto_grant_super_admin') THEN
    DROP TRIGGER tg_auto_grant_super_admin ON auth.users;
  END IF;
END $$;
CREATE TRIGGER tg_auto_grant_super_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.auto_grant_super_admin();