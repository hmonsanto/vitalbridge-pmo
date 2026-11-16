-- Row Level Security: owner full access, viewer read-only, anonymous nothing.
create function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;
revoke execute on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'projects', 'phases', 'gates', 'deliverables', 'risks',
    'dependencies', 'baseline_entries', 'todos', 'meetings'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      t || '_read', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_owner()) with check (public.is_owner())',
      t || '_owner_write', t);
  end loop;
end $$;

-- Profiles: read own row (owner reads all). No write policies: roles change only via service role.
alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_owner());

-- Audit log: any signed-in user may append their own entries; only the owner reads.
alter table public.audit_log enable row level security;
create policy audit_insert on public.audit_log for insert to authenticated
  with check (actor = auth.uid());
create policy audit_read on public.audit_log for select to authenticated
  using (public.is_owner());
