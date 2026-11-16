import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Dialog } from "@/components/ui/Dialog";
import { EditDependencyForm, EditMeetingForm, EditTodoForm } from "@/components/edit/EditForms";
import { deleteDependency } from "@/app/(app)/hospitals/edit-actions";
import { deleteMeeting, deleteTodo } from "@/app/(app)/todos/actions";
import { DayForms } from "./DayForms";
import { KIND_LABEL } from "./EventChip";
import type { CalendarEvent, HospitalOption } from "./types";

const dayTitle = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** Edit and delete for one event, using the form that matches its kind. */
function EventActions({ event: e }: { event: CalendarEvent }) {
  if (e.kind === "meeting") {
    return (
      <>
        <Dialog icon="edit" triggerLabel={`Edit meeting ${e.title}`} title="Edit meeting">
          <EditMeetingForm meeting={{ id: e.id, title: e.title, startsAt: e.meta?.startsAt ?? `${e.date}T09:00` }} />
        </Dialog>
        <DeleteButton label={`meeting ${e.title}`} action={deleteMeeting.bind(null, e.id)} />
      </>
    );
  }
  if (e.kind === "todo") {
    return (
      <>
        <Dialog icon="edit" triggerLabel={`Edit to-do ${e.title}`} title="Edit to-do">
          <EditTodoForm todo={{ id: e.id, title: e.title, due_date: e.date }} />
        </Dialog>
        <DeleteButton label={`to-do ${e.title}`} action={deleteTodo.bind(null, e.id)} />
      </>
    );
  }
  const projectId = e.meta?.projectId;
  if (!projectId) return null;
  return (
    <>
      <Dialog icon="edit" triggerLabel={`Edit dependency ${e.title}`} title="Edit dependency">
        <EditDependencyForm
          projectId={projectId}
          dependency={{ id: e.id, title: e.title, type: e.meta?.type ?? "other", due_date: e.date, status: e.meta?.status ?? "pending" }}
        />
      </Dialog>
      <DeleteButton label={`dependency ${e.title}`} action={deleteDependency.bind(null, projectId, e.id)} />
    </>
  );
}

/** Everything on the selected day, with quick-add forms and edit/delete for the owner. */
export function DayPanel({
  day,
  events,
  hospitals,
  isOwner,
}: {
  day: string;
  events: CalendarEvent[];
  hospitals: HospitalOption[];
  isOwner: boolean;
}) {
  return (
    <Card title={dayTitle(day)} className="scroll-mt-4">
      {events.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nothing on this day.</p>
      ) : (
        <ul aria-label="Events on this day" className="space-y-2.5">
          {events.map((e) => (
            <li key={`${e.kind}-${e.id}`} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="font-medium">{e.title}</span>
                {e.detail && <span className="block text-xs text-[var(--muted)]">{e.detail}</span>}
              </span>
              <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                {e.overdue && <Badge tone="danger">Overdue</Badge>}
                <Badge tone={e.kind === "dependency" ? "warn" : "info"}>{KIND_LABEL[e.kind]}</Badge>
                {e.href && (
                  <Link href={e.href} className="text-xs font-semibold text-[var(--link)] hover:underline">
                    Open
                  </Link>
                )}
                {isOwner && <EventActions event={e} />}
              </span>
            </li>
          ))}
        </ul>
      )}
      {isOwner && <DayForms key={day} day={day} hospitals={hospitals} />}
    </Card>
  );
}
