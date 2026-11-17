-- Three roles instead of two, and the functions an administrator uses to manage the team.
--
--   owner  (shown as "Admin")  everything, plus managing people
--   editor                     creates and edits project data, but cannot manage people or read the audit log
--   viewer                     reads only
--
-- Accounts are still created by hand in the Supabase dashboard. Everything below runs inside the database
-- as SECURITY DEFINER functions that check the caller is an admin, so the app needs no service-role key.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('owner', 'editor', 'viewer'));

create function public.can_edit() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('owner', 'editor')
  );
$$;
revoke execute on function public.can_edit() from public;
grant execute on function public.can_edit() to anon, authenticated;

-- Writing project data moves from "owner only" to "owner or editor". Everyone signed in can still read.
do $$
declare
  t text;
begin
  foreach t in array array[
    'projects', 'phases', 'gates', 'deliverables', 'risks',
    'dependencies', 'baseline_entries', 'todos', 'meetings'
  ] loop
    execute format('drop policy %I on public.%I', t || '_owner_write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.can_edit()) with check (public.can_edit())',
      t || '_write', t);
  end loop;
end $$;

-- The team list: who they are, their role, and whether they have two-step verification. Admins only.
create function public.team_members() returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  banned boolean,
  mfa_enabled boolean
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'Administrators only' using errcode = '42501';
  end if;
  return query
    select p.id, u.email::text, p.full_name, p.role, u.created_at, u.last_sign_in_at,
           coalesce(u.banned_until > now(), false),
           exists (select 1 from auth.mfa_factors f where f.user_id = p.id and f.status = 'verified')
    from public.profiles p
    join auth.users u on u.id = p.id
    order by (p.role = 'owner') desc, lower(coalesce(p.full_name, u.email)), u.email;
end $$;

-- Changes someone's role. An admin cannot change their own, so the project can never be left without an admin.
create function public.set_user_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'Administrators only' using errcode = '42501';
  end if;
  if new_role not in ('owner', 'editor', 'viewer') then
    raise exception 'Unknown role' using errcode = '22023';
  end if;
  if target = auth.uid() then
    raise exception 'You cannot change your own role' using errcode = '22023';
  end if;

  update public.profiles set role = new_role where id = target;
  if not found then
    raise exception 'Person not found' using errcode = '22023';
  end if;
  insert into public.audit_log (actor, action, table_name, row_id)
  values (auth.uid(), 'team_role_change', 'profiles', target::text || ':' || new_role);
end $$;

create function public.set_user_name(target uuid, new_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'Administrators only' using errcode = '42501';
  end if;
  if length(trim(coalesce(new_name, ''))) not between 1 and 80 then
    raise exception 'A name has 1 to 80 characters' using errcode = '22023';
  end if;

  update public.profiles set full_name = trim(new_name) where id = target;
  if not found then
    raise exception 'Person not found' using errcode = '22023';
  end if;
  insert into public.audit_log (actor, action, table_name, row_id)
  values (auth.uid(), 'team_name_change', 'profiles', target::text);
end $$;

-- Deactivating blocks sign-in and ends the person's sessions, so access stops at once instead of when their
-- token expires. Their data stays. An admin cannot deactivate themselves.
create function public.set_user_active(target uuid, active boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'Administrators only' using errcode = '42501';
  end if;
  if target = auth.uid() then
    raise exception 'You cannot deactivate your own account' using errcode = '22023';
  end if;

  update auth.users
  set banned_until = case when active then null else now() + interval '100 years' end
  where id = target;
  if not found then
    raise exception 'Person not found' using errcode = '22023';
  end if;
  if not active then
    delete from auth.sessions where user_id = target;
  end if;
  insert into public.audit_log (actor, action, table_name, row_id)
  values (auth.uid(), 'team_active_change', 'profiles', target::text || ':' || active::text);
end $$;

revoke all on function public.team_members() from public, anon;
revoke all on function public.set_user_role(uuid, text) from public, anon;
revoke all on function public.set_user_name(uuid, text) from public, anon;
revoke all on function public.set_user_active(uuid, boolean) from public, anon;
grant execute on function public.team_members() to authenticated;
grant execute on function public.set_user_role(uuid, text) to authenticated;
grant execute on function public.set_user_name(uuid, text) to authenticated;
grant execute on function public.set_user_active(uuid, boolean) to authenticated;
