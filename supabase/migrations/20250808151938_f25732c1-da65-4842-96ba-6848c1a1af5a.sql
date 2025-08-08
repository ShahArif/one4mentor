-- 1) Roles enum and user_roles table
create type if not exists public.app_role as enum ('super_admin','admin','mentor','candidate');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- has_role helper
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

-- 2) Profiles table and triggers
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

-- Trigger to insert a profile on signup
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

-- Recreate trigger idempotently
do $$ begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    drop trigger on_auth_user_created on auth.users;
  end if;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) Onboarding requests
create type if not exists public.request_status as enum ('pending','approved','rejected');

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

-- RLS for onboarding tables
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

-- 4) Auto-seed super admin role for a@b.com when that user signs up
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

do $$ begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'tg_auto_grant_super_admin'
  ) then
    drop trigger tg_auto_grant_super_admin on auth.users;
  end if;
end $$;

create trigger tg_auto_grant_super_admin
after insert on auth.users
for each row execute procedure public.auto_grant_super_admin();