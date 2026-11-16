begin;
select plan(17);

-- Two users; user 1 has a verified authenticator factor.
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'rec1@test.local'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'rec2@test.local');
insert into auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret)
values (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Authenticator', 'totp', 'verified', now(), now(), 'x');

create temp table scratch (codes text[]);
insert into scratch values (null);
grant all on scratch to authenticated;

-- ---- generating codes needs a completed MFA step (aal2) ----
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1","role":"authenticated","aal":"aal1"}', true);
select throws_ok($$select public.generate_recovery_codes()$$, '42501', null, 'aal1 cannot generate codes');

select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1","role":"authenticated","aal":"aal2"}', true);
update scratch set codes = public.generate_recovery_codes();
select is(array_length((select codes from scratch), 1), 10, 'aal2 gets ten codes');
select matches((select codes[1] from scratch), '^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$', 'codes use the XXXX-XXXX-XXXX format');
select is((select count(distinct c) from scratch, unnest(codes) c), 10::bigint, 'the ten codes are distinct');
select is(public.recovery_codes_remaining(), 10, 'ten codes remaining');
select throws_ok($$select * from public.mfa_recovery_codes$$, '42501', null, 'the code table is not readable by users');

-- ---- another user cannot use them, and is counted as a failed attempt ----
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2","role":"authenticated","aal":"aal1"}', true);
select is(public.use_recovery_code((select codes[1] from scratch)), false, 'a code of another user does not work');

-- ---- using a code (aal1 session is enough) ----
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1","role":"authenticated","aal":"aal1"}', true);
select is(public.use_recovery_code('not-a-code'), false, 'garbage is rejected');
select is(public.use_recovery_code(lower(replace((select codes[2] from scratch), '-', ''))), true,
  'a code works in lowercase without dashes');

reset role;
select is((select count(*) from auth.mfa_factors where user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'), 0::bigint,
  'using a code removes the lost authenticator');
select is((select count(*) from public.mfa_recovery_codes where user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'), 0::bigint,
  'using a code invalidates all remaining codes');

set local role authenticated;
select is(public.use_recovery_code((select codes[2] from scratch)), false, 'a used code cannot be used twice');

-- ---- brute force protection ----
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1","role":"authenticated","aal":"aal2"}', true);
update scratch set codes = public.generate_recovery_codes();
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1","role":"authenticated","aal":"aal1"}', true);
select public.use_recovery_code('0000-0000-0001');
select public.use_recovery_code('0000-0000-0002');
select public.use_recovery_code('0000-0000-0003');
select public.use_recovery_code('0000-0000-0004');
select public.use_recovery_code('0000-0000-0005');
select is(public.use_recovery_code((select codes[1] from scratch)), false,
  'after five wrong guesses even a correct code is refused');

-- ---- regenerating replaces the old set ----
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2","role":"authenticated","aal":"aal2"}', true);
update scratch set codes = public.generate_recovery_codes();
select is(public.recovery_codes_remaining(), 10, 'regenerating gives a fresh set of ten');
update scratch set codes = public.generate_recovery_codes();
select is(public.recovery_codes_remaining(), 10, 'regenerating again does not accumulate codes');

-- ---- anonymous users cannot call any of it ----
reset role;
set local role anon;
select throws_ok($$select public.generate_recovery_codes()$$, '42501', null, 'anonymous cannot generate');
select throws_ok($$select public.use_recovery_code('0000-0000-0000')$$, '42501', null, 'anonymous cannot use a code');

select * from finish();
rollback;
