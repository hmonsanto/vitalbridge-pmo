-- VitalBridge RX PMO dashboard schema
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'viewer')),
  created_at timestamptz not null default now()
);

-- New auth users start as viewers; the owner is promoted manually.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role) values (new.id, 'viewer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  kind text not null default 'hospital' check (kind in ('hospital', 'pmo')),
  scenario text check (scenario in ('A', 'B', 'C')),
  current_phase int not null default 1 check (current_phase between 1 and 6),
  created_at timestamptz not null default now(),
  constraint hospital_requires_scenario check (kind <> 'hospital' or scenario is not null)
);

create table public.phases (
  number int primary key check (number between 1 and 6),
  name text not null
);
insert into public.phases (number, name) values
  (1, 'Initial assessment'), (2, 'Governance'), (3, 'Operational readiness'),
  (4, 'Launch and stabilization'), (5, 'Handover and closure'), (6, 'Continuous improvement');

create table public.gates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  code text not null,
  decision text check (decision in ('go', 'go_with_conditions', 'replan', 'stop')),
  decided_on date,
  notes text,
  unique (project_id, code)
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  phase int not null check (phase between 1 and 6),
  name text not null,
  owner text,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed', 'blocked')),
  doc_url text,
  remarks text
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  owner text,
  status text not null default 'open' check (status in ('open', 'mitigating', 'closed'))
);

create table public.dependencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  type text not null check (type in ('license', 'dea', '340b', 'payer', 'accreditation', 'other')),
  title text not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'blocked'))
);

create table public.baseline_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  month date not null,
  baseline numeric not null check (baseline >= 0),
  actual numeric not null check (actual >= 0),
  unique (project_id, month)
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  starts_at timestamptz not null
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  table_name text,
  row_id text,
  at timestamptz not null default now()
);
