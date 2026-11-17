-- Display name for each person, so the app can greet them (and later list the team) by name.

alter table public.profiles
  add column full_name text check (full_name is null or length(trim(full_name)) between 1 and 80);

-- People created before this migration keep working; if an invitation already carried a name, use it.
update public.profiles p
set full_name = nullif(trim(u.raw_user_meta_data ->> 'full_name'), '')
from auth.users u
where u.id = p.id and p.full_name is null;

-- New accounts take the name from the invitation metadata, if there is one.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'viewer', left(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 80));
  return new;
end $$;

-- Everyone may change their own display name and nothing else. The grant is per column, so even a crafted
-- request cannot touch "role": the database refuses it before row-level security is consulted.
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy profiles_update_own_name on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
