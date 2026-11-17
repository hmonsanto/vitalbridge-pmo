begin;
select plan(16);

-- Setup as superuser
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'viewer@test.local');
update public.profiles set role = 'owner' where id = '11111111-1111-1111-1111-111111111111';
insert into public.projects (id, name, kind, scenario) values
  ('99999999-9999-9999-9999-999999999999', 'RLS Hospital', 'hospital', 'A');
insert into public.risks (id, project_id, title, severity) values
  ('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', 'r', 'low');
insert into public.baseline_entries (id, project_id, month, baseline, actual) values
  ('77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999', '2030-01-01', 1, 2);
insert into public.audit_log (actor, action) values (null, 'seeded');

-- ANON
set local role anon;
select is((select count(*) from public.projects), 0::bigint, 'anon reads zero projects');
select throws_ok(
  $$insert into public.projects (name, kind, scenario) values ('x', 'hospital', 'A')$$,
  '42501', null, 'anon cannot insert');

-- VIEWER
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select ok((select count(*) from public.projects) > 0, 'viewer reads projects');
select throws_ok(
  $$insert into public.projects (name, kind, scenario) values ('x', 'hospital', 'A')$$,
  '42501', null, 'viewer cannot insert projects');
select is_empty(
  $$update public.risks set title = 'hacked' returning 1$$, 'viewer update affects nothing');
select is_empty(
  $$delete from public.baseline_entries returning 1$$, 'viewer delete affects nothing');
select throws_ok(
  $$insert into public.baseline_entries (project_id, month, baseline, actual)
    values ('99999999-9999-9999-9999-999999999999', '2030-02-01', 1, 1)$$,
  '42501', null, 'viewer cannot insert baseline entries');
select throws_ok(
  $$update public.profiles set role = 'owner'
    where id = '22222222-2222-2222-2222-222222222222'$$,
  '42501', null, 'viewer cannot promote self to owner');
select is((select count(*) from public.audit_log), 0::bigint, 'viewer reads no audit log rows');
select lives_ok(
  $$insert into public.audit_log (actor, action)
    values ('22222222-2222-2222-2222-222222222222', 'sign_in')$$,
  'viewer can write own audit row');

-- OWNER
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$insert into public.projects (name, kind, scenario) values ('Owner H', 'hospital', 'B')$$,
  'owner can insert projects');
select isnt_empty(
  $$update public.risks set title = 'ok' returning 1$$, 'owner can update risks');
select isnt_empty(
  $$delete from public.baseline_entries returning 1$$, 'owner can delete baseline entries');
select ok((select count(*) from public.audit_log) > 0, 'owner reads audit log');
select throws_ok(
  $$update public.profiles set role = 'viewer'
    where id = '22222222-2222-2222-2222-222222222222'$$,
  '42501', null, 'owner cannot change roles through the API');
select ok(public.is_owner(), 'is_owner() is true for owner');

select * from finish();
rollback;
