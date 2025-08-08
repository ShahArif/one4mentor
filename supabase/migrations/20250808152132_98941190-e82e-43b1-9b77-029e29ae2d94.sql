-- Create enums safely
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

-- user_roles table and RLS
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

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

create policy if not exists "Users can read their roles"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy if not exists "Super admins can manage all roles"
  on public.user_roles
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- profiles table and triggers
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger tr_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

create policy if not exists "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy if not exists "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid());

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

create or replace trigger tr_mentor_onboarding_updated_at
before update on public.mentor_onboarding_requests
for each row execute function public.update_updated_at_column();

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

create or replace trigger tr_candidate_onboarding_updated_at
before update on public.candidate_onboarding_requests
for each row execute function public.update_updated_at_column();

-- RLS policies for onboarding tables
create policy if not exists "Users can create their mentor requests"
  on public.mentor_onboarding_requests
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy if not exists "Users can view their mentor requests"
  on public.mentor_onboarding_requests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy if not exists "Users can update their pending mentor requests"
  on public.mentor_onboarding_requests
  for update
  to authenticated
  using (user_id = auth.uid() and status = 'pending');

create policy if not exists "Super admins manage all mentor requests"
  on public.mentor_onboarding_requests
  for all
  to authenticated
  using (public.has_role(auth.uid(),'super_admin'))
  with check (public.has_role(auth.uid(),'super_admin'));

create policy if not exists "Users can create their candidate requests"
  on public.candidate_onboarding_requests
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy if not exists "Users can view their candidate requests"
  on public.candidate_onboarding_requests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy if not exists "Users can update their pending candidate requests"
  on public.candidate_onboarding_requests
  for update
  to authenticated
  using (user_id = auth.uid() and status = 'pending');

create policy if not exists "Super admins manage all candidate requests"
  on public.candidate_onboarding_requests
  for all
  to authenticated
  using (public.has_role(auth.uid(),'super_admin'))
  with check (public.has_role(auth.uid(),'super_admin'));

-- Auto-grant super admin to a@b.com upon signup
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

create trigger tg_auto_grant_super_admin
after insert on auth.users
for each row execute procedure public.auto_grant_super_admin();