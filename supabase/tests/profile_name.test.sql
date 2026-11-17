begin;
select plan(7);

insert into auth.users (id, email) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'name1@test.local'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'name2@test.local');
insert into auth.users (id, email, raw_user_meta_data)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'name3@test.local', '{"full_name": "  Ada Lovelace  "}');

select is((select full_name from public.profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'), 'Ada Lovelace',
  'a new user gets the name from the invitation metadata, trimmed');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1","role":"authenticated","aal":"aal1"}', true);

select lives_ok(
  $$update public.profiles set full_name = 'Grace Hopper' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'$$,
  'a user can change their own name');
select is((select full_name from public.profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'), 'Grace Hopper',
  'and it is saved');
select is_empty(
  $$update public.profiles set full_name = 'Hacked' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2' returning 1$$,
  'a user cannot change someone else''s name');
select throws_ok(
  $$update public.profiles set role = 'owner' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'$$,
  '42501', null, 'a user cannot change their own role, even though they can change their name');
select throws_ok(
  $$update public.profiles set full_name = '   ' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'$$,
  '23514', null, 'a blank name is rejected');

reset role;
set local role anon;
select throws_ok(
  $$update public.profiles set full_name = 'Anon' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'$$,
  '42501', null, 'anonymous visitors cannot update profiles');

select * from finish();
rollback;
