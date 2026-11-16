begin;
select plan(5);

select has_table('public', 'projects', 'projects table exists');
select has_table('public', 'baseline_entries', 'baseline_entries table exists');
select throws_ok(
  $$insert into public.projects (name, scenario, kind) values ('Bad', 'D', 'hospital')$$,
  '23514', null, 'scenario D is rejected');
select lives_ok(
  $$insert into public.projects (name, scenario, kind) values ('Good', 'A', 'hospital')$$,
  'scenario A is accepted');
select throws_ok(
  $$insert into public.projects (name, scenario, kind, current_phase) values ('Phase7', 'A', 'hospital', 7)$$,
  '23514', null, 'phase 7 is rejected');

select * from finish();
rollback;
