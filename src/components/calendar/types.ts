export type EventKind = "dependency" | "meeting" | "todo";

export type CalendarEvent = {
  id: string;
  /** Local calendar day, "YYYY-MM-DD". */
  date: string;
  kind: EventKind;
  title: string;
  /** Secondary text: the hospital for a dependency, the time for a meeting. */
  detail?: string;
  overdue?: boolean;
  href?: string;
  /** What the owner's edit form needs to prefill, beyond the fields above. */
  meta?: { projectId?: string; type?: string; status?: string; startsAt?: string };
};

export type HospitalOption = { id: string; name: string };
