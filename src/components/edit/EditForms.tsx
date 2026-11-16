"use client";

import { Field, FormFooter, SelectField, TextAreaField } from "@/components/ui/Field";
import { useDialogAction } from "@/components/ui/Dialog";
import {
  deleteHospital,
  updateBaselineEntry,
  updateDependency,
  updateDeliverable,
  updateHospital,
  updateRisk,
} from "@/app/(app)/hospitals/edit-actions";
import { updateMeeting, updateTodo } from "@/app/(app)/todos/actions";

const FORM = "space-y-3";

const SCENARIOS = [
  { value: "A", label: "A: hospital with a pharmacy" },
  { value: "B", label: "B: program, no pharmacy" },
  { value: "C", label: "C: starting from scratch" },
];

export function EditHospitalForm({ projectId, name, scenario }: { projectId: string; name: string; scenario: string | null }) {
  const [state, action, pending] = useDialogAction(updateHospital.bind(null, projectId));
  return (
    <form action={action} className={FORM}>
      <Field label="Name" name="name" defaultValue={name} required />
      <SelectField label="Scenario" name="scenario" defaultValue={scenario ?? "A"} options={SCENARIOS} />
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}

/** Deleting a hospital removes all of its data, so the exact name has to be typed. */
export function DeleteHospitalForm({ projectId, name }: { projectId: string; name: string }) {
  const [state, action, pending] = useDialogAction(deleteHospital.bind(null, projectId));
  return (
    <form action={action} className={FORM}>
      <p className="text-sm">
        This permanently deletes <strong>{name}</strong> together with all of its deliverables, risks, dependencies and
        baseline entries. It cannot be undone.
      </p>
      <Field label="Type the hospital name to confirm" name="confirm" required />
      <FormFooter pending={pending} error={state?.error} submitLabel="Delete hospital permanently" danger />
    </form>
  );
}

export type EditableDeliverable = {
  id: string;
  name: string;
  phase: number;
  owner: string | null;
  doc_url: string | null;
  remarks: string | null;
};

export function EditDeliverableForm({ projectId, row }: { projectId: string; row: EditableDeliverable }) {
  const [state, action, pending] = useDialogAction(updateDeliverable.bind(null, projectId, row.id));
  return (
    <form action={action} className={FORM}>
      <Field label="Name" name="name" defaultValue={row.name} required />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Phase"
          name="phase"
          defaultValue={String(row.phase)}
          options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))}
        />
        <Field label="Owner" name="owner" defaultValue={row.owner} />
      </div>
      <Field label="Document link" name="doc_url" defaultValue={row.doc_url} placeholder="https://" />
      <TextAreaField label="Remarks" name="remarks" defaultValue={row.remarks} />
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}

export type EditableRisk = { id: string; title: string; severity: string; owner: string | null; status: string };

export function EditRiskForm({ projectId, risk }: { projectId: string; risk: EditableRisk }) {
  const [state, action, pending] = useDialogAction(updateRisk.bind(null, projectId, risk.id));
  return (
    <form action={action} className={FORM}>
      <Field label="Title" name="title" defaultValue={risk.title} required />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Severity"
          name="severity"
          defaultValue={risk.severity}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ]}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={risk.status}
          options={[
            { value: "open", label: "Open" },
            { value: "mitigating", label: "Mitigating" },
            { value: "closed", label: "Closed" },
          ]}
        />
      </div>
      <Field label="Owner" name="owner" defaultValue={risk.owner} />
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}

export type EditableDependency = { id: string; title: string; type: string; due_date: string; status: string };

export function EditDependencyForm({ projectId, dependency }: { projectId: string; dependency: EditableDependency }) {
  const [state, action, pending] = useDialogAction(updateDependency.bind(null, projectId, dependency.id));
  return (
    <form action={action} className={FORM}>
      <Field label="Title" name="title" defaultValue={dependency.title} required />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Type"
          name="type"
          defaultValue={dependency.type}
          options={[
            { value: "license", label: "License" },
            { value: "dea", label: "DEA" },
            { value: "340b", label: "340B" },
            { value: "payer", label: "Payer contract" },
            { value: "accreditation", label: "Accreditation" },
            { value: "other", label: "Other" },
          ]}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={dependency.status}
          options={[
            { value: "pending", label: "Pending" },
            { value: "in_progress", label: "In progress" },
            { value: "blocked", label: "Blocked" },
            { value: "done", label: "Done" },
          ]}
        />
      </div>
      <Field label="Due date" name="due_date" type="date" defaultValue={dependency.due_date} required />
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}

export type EditableBaseline = { id: string; month: string; baseline: number; actual: number };

export function EditBaselineForm({ projectId, entry }: { projectId: string; entry: EditableBaseline }) {
  const [state, action, pending] = useDialogAction(updateBaselineEntry.bind(null, projectId, entry.id));
  return (
    <form action={action} className={FORM}>
      <p className="text-sm text-[var(--muted)]">
        Month: <strong className="text-[var(--heading)]">{entry.month.slice(0, 7)}</strong>. To change the month, delete the
        entry and add it again.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Baseline ($)" name="baseline" type="number" step="0.01" min="0" defaultValue={entry.baseline} required />
        <Field label="Actual ($)" name="actual" type="number" step="0.01" min="0" defaultValue={entry.actual} required />
      </div>
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}

export function EditTodoForm({ todo }: { todo: { id: string; title: string; due_date: string | null } }) {
  const [state, action, pending] = useDialogAction(updateTodo.bind(null, todo.id));
  return (
    <form action={action} className={FORM}>
      <Field label="Title" name="title" defaultValue={todo.title} required />
      <Field label="Due date" name="due_date" type="date" defaultValue={todo.due_date} />
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}

export function EditMeetingForm({ meeting }: { meeting: { id: string; title: string; startsAt: string } }) {
  const [state, action, pending] = useDialogAction(updateMeeting.bind(null, meeting.id));
  return (
    <form action={action} className={FORM}>
      <Field label="Title" name="title" defaultValue={meeting.title} required />
      <Field label="Starts at" name="starts_at" type="datetime-local" defaultValue={meeting.startsAt} required />
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}
