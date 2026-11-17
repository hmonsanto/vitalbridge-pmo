begin;
select plan(20);

-- A = admin (role "owner"), E = editor, V = viewer, X = another viewer with a verified authenticator and a session.
insert into auth.users (id, email) values
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'admin@test.local'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'editor@test.local'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'viewer@test.local'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'x@test.local');
update public.profiles set role = 'owner' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc1';
update public.profiles set role = 'editor' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc2';
insert into auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret)
values (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-ccccccccccc4', 'Authenticator', 'totp', 'verified', now(), now(), 'x');
insert into auth.sessions (id, user_id) values (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-ccccccccccc4');

-- ---- editor ----
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-ccccccccccc2","role":"authenticated","aal":"aal2"}', true);
select ok(public.can_edit(), 'an editor can edit');
select lives_ok(
  $$insert into public.projects (name, kind, scenario) values ('Editor H', 'hospital', 'A')$$,
  'an editor can create project data');
select throws_ok($$select * from public.team_members()$$, '42501', null, 'an editor cannot list the team');
select is((select count(*) from public.profiles), 1::bigint, 'an editor sees only their own profile');

-- ---- viewer ----
select set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-ccccccccccc3","role":"authenticated","aal":"aal1"}', true);
select ok(not public.can_edit(), 'a viewer cannot edit');
select throws_ok(
  $$insert into public.projects (name, kind, scenario) values ('Viewer H', 'hospital', 'A')$$,
  '42501', null, 'a viewer cannot create project data');
select throws_ok($$select public.set_user_role('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'editor')$$, '42501', null,
  'a viewer cannot change roles');

-- ---- admin ----
select set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-ccccccccccc1","role":"authenticated","aal":"aal2"}', true);
select cmp_ok((select count(*) from public.team_members()), '>=', 4::bigint, 'the admin sees everyone');
select is((select email from public.team_members() where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'), 'x@test.local',
  'the team list includes each email');
select is((select mfa_enabled from public.team_members() where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'), true,
  'and whether each person has two-step verification');

select public.set_user_role('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'editor');
select is((select role from public.profiles where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'), 'editor',
  'the admin can change someone''s role');
select throws_ok($$select public.set_user_role('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'viewer')$$, '22023', null,
  'the admin cannot change their own role');
select throws_ok($$select public.set_user_role('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'god')$$, '22023', null,
  'an unknown role is refused');

select public.set_user_name('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'Xavier');
select is((select full_name from public.profiles where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'), 'Xavier',
  'the admin can set a person''s name');

-- Deactivating blocks sign-in and ends the person's sessions.
select public.set_user_active('cccccccc-cccc-cccc-cccc-ccccccccccc4', false);
reset role;
select isnt((select banned_until from auth.users where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'), null,
  'deactivating bans the account');
select is((select count(*) from auth.sessions where user_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'), 0::bigint,
  'and ends its sessions');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-ccccccccccc1","role":"authenticated","aal":"aal2"}', true);
select public.set_user_active('cccccccc-cccc-cccc-cccc-ccccccccccc4', true);
reset role;
select is((select banned_until from auth.users where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'), null,
  'reactivating lifts the ban');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-ccccccccccc1","role":"authenticated","aal":"aal2"}', true);
select throws_ok($$select public.set_user_active('cccccccc-cccc-cccc-cccc-ccccccccccc1', false)$$, '22023', null,
  'the admin cannot deactivate themselves');

reset role;
select cmp_ok((select count(*) from public.audit_log where action like 'team_%'), '>=', 4::bigint,
  'every team change is written to the audit log');
select throws_ok($$update public.profiles set role = 'god' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc3'$$, '23514', null,
  'the database only accepts the three known roles');

select * from finish();
rollback;
