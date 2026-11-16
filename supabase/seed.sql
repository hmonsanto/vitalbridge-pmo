-- Demo data for local development only.
insert into public.projects (id, name, kind, scenario, current_phase) values
  ('00000000-0000-0000-0000-0000000000a1', 'PMO build-out', 'pmo', null, 1),
  ('00000000-0000-0000-0000-0000000000b1', 'Demo Hospital A', 'hospital', 'A', 3),
  ('00000000-0000-0000-0000-0000000000b2', 'Demo Hospital C', 'hospital', 'C', 1);

insert into public.gates (project_id, code, decision, decided_on) values
  ('00000000-0000-0000-0000-0000000000a1', 'G0', null, null),
  ('00000000-0000-0000-0000-0000000000a1', 'G1', null, null),
  ('00000000-0000-0000-0000-0000000000a1', 'G2', null, null),
  ('00000000-0000-0000-0000-0000000000a1', 'G3', null, null),
  ('00000000-0000-0000-0000-0000000000a1', 'G4', null, null),
  ('00000000-0000-0000-0000-0000000000a1', 'G5', null, null),
  ('00000000-0000-0000-0000-0000000000b1', 'G1', 'go', current_date - 60),
  ('00000000-0000-0000-0000-0000000000b1', 'G2', 'go_with_conditions', current_date - 30),
  ('00000000-0000-0000-0000-0000000000b2', 'G1', null, null);

insert into public.deliverables (project_id, phase, name, owner, status, remarks) values
  ('00000000-0000-0000-0000-0000000000b1', 1, 'Handover summary', 'PM', 'completed', 'Signed off'),
  ('00000000-0000-0000-0000-0000000000b1', 3, 'DEA registration filing', 'HL', 'in_progress', 'Waiting on hospital lead'),
  ('00000000-0000-0000-0000-0000000000b2', 1, 'Feasibility assessment', 'PM', 'not_started', null);

insert into public.risks (project_id, title, severity, owner, status) values
  ('00000000-0000-0000-0000-0000000000b1', 'Hospital finances unstable', 'critical', 'PM', 'open'),
  ('00000000-0000-0000-0000-0000000000b2', 'Eligibility test may fail', 'high', 'PM', 'open');

insert into public.dependencies (project_id, type, title, due_date, status) values
  ('00000000-0000-0000-0000-0000000000b1', 'dea', 'DEA registration', current_date - 3, 'in_progress'),
  ('00000000-0000-0000-0000-0000000000b1', '340b', '340B enrollment', current_date + 30, 'pending');

insert into public.baseline_entries (project_id, month, baseline, actual) values
  ('00000000-0000-0000-0000-0000000000b1', date_trunc('month', current_date - interval '2 month')::date, 100000, 112000),
  ('00000000-0000-0000-0000-0000000000b1', date_trunc('month', current_date - interval '1 month')::date, 100000, 96000);

insert into public.todos (title, due_date) values
  ('Session with the sponsor', current_date + 1),
  ('Request access and documentation', current_date + 2);

insert into public.meetings (project_id, title, starts_at) values
  (null, 'Status sync', now() + interval '2 hour');
