-- MFA recovery codes: a way back in after losing the authenticator app.
--
-- Codes are stored only as bcrypt hashes. Users never touch the tables: everything goes through the
-- three SECURITY DEFINER functions below, so the app does not need the service-role key.

create table public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  created_at timestamptz not null default now()
);
create index mfa_recovery_codes_user_idx on public.mfa_recovery_codes (user_id);

-- Failed guesses, to throttle brute force.
create table public.mfa_recovery_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);
create index mfa_recovery_attempts_user_idx on public.mfa_recovery_attempts (user_id, at);

alter table public.mfa_recovery_codes enable row level security;
alter table public.mfa_recovery_attempts enable row level security;
revoke all on public.mfa_recovery_codes from anon, authenticated;
revoke all on public.mfa_recovery_attempts from anon, authenticated;

-- Creates a fresh set of ten codes, replacing any earlier set. Returns them in clear text exactly once.
-- Requires a session that already passed the second factor (aal2).
create function public.generate_recovery_codes() returns text[]
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := auth.uid();
  result text[] := '{}';
  raw text;
begin
  if uid is null or coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'A completed two-step verification is required' using errcode = '42501';
  end if;

  delete from public.mfa_recovery_codes where user_id = uid;
  for i in 1..10 loop
    raw := upper(encode(gen_random_bytes(6), 'hex')); -- 12 hex characters, 48 bits
    insert into public.mfa_recovery_codes (user_id, code_hash) values (uid, crypt(raw, gen_salt('bf', 8)));
    result := result || (substr(raw, 1, 4) || '-' || substr(raw, 5, 4) || '-' || substr(raw, 9, 4));
  end loop;
  return result;
end $$;

create function public.recovery_codes_remaining() returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::integer from public.mfa_recovery_codes where user_id = auth.uid();
$$;

-- Redeems a code. On success the lost authenticator is removed and every remaining code is invalidated, so
-- the user must enrol again and receive a new set. Five wrong guesses in 15 minutes lock further attempts.
create function public.use_recovery_code(code text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := auth.uid();
  normalized text;
  hit uuid;
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  if (select count(*) from public.mfa_recovery_attempts where user_id = uid and at > now() - interval '15 minutes') >= 5 then
    return false;
  end if;

  normalized := upper(regexp_replace(coalesce(code, ''), '[\s-]', '', 'g'));
  if normalized !~ '^[0-9A-F]{12}$' then
    insert into public.mfa_recovery_attempts (user_id) values (uid);
    return false;
  end if;

  select id into hit from public.mfa_recovery_codes
  where user_id = uid and code_hash = crypt(normalized, code_hash)
  limit 1;

  if hit is null then
    insert into public.mfa_recovery_attempts (user_id) values (uid);
    return false;
  end if;

  delete from auth.mfa_factors where user_id = uid;
  delete from public.mfa_recovery_codes where user_id = uid;
  delete from public.mfa_recovery_attempts where user_id = uid;
  return true;
end $$;

revoke all on function public.generate_recovery_codes() from public, anon;
revoke all on function public.recovery_codes_remaining() from public, anon;
revoke all on function public.use_recovery_code(text) from public, anon;
grant execute on function public.generate_recovery_codes() to authenticated;
grant execute on function public.recovery_codes_remaining() to authenticated;
grant execute on function public.use_recovery_code(text) to authenticated;
