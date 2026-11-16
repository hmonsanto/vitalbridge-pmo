import type { CalendarEvent } from "./types";

const STYLE: Record<CalendarEvent["kind"], string> = {
  dependency: "bg-[#f1dca7] text-[#6b4a0d] dark:bg-[#5a4620] dark:text-[#f1dca7]",
  meeting: "bg-[#6b1f2a] text-white dark:bg-[#8a2a38]",
  todo: "bg-[#3a332c] text-white dark:bg-[#5a4f44]",
};
const OVERDUE = "bg-[#f4b8b0] text-[#7f1d1d] dark:bg-[#6e2323] dark:text-[#f9d0cb]";

export const KIND_LABEL: Record<CalendarEvent["kind"], string> = {
  dependency: "Dependency",
  meeting: "Meeting",
  todo: "To-do",
};

/** Small colored label for one event inside a day cell. */
export function EventChip({ event }: { event: CalendarEvent }) {
  return (
    <span
      data-kind={event.kind}
      data-overdue={event.overdue ? "true" : undefined}
      title={`${KIND_LABEL[event.kind]}: ${event.title}`}
      className={`block truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${
        event.overdue ? OVERDUE : STYLE[event.kind]
      }`}
    >
      {event.title}
    </span>
  );
}
