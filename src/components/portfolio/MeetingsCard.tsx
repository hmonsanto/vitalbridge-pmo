import { Card } from "@/components/ui/Card";

export type MeetingItem = { id: string; title: string; starts_at: string };

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/** Timeline of upcoming meetings: a vertical accent line with a dot per meeting. */
export function MeetingsCard({ meetings }: { meetings: MeetingItem[] }) {
  return (
    <Card title="Today's scheduled meetings" delay={0.15}>
      {meetings.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nothing scheduled.</p>
      ) : (
        <ul className="relative space-y-3 border-l-2 border-[var(--track)] pl-4">
          {meetings.map((m) => (
            <li key={m.id} className="relative text-sm">
              <span className="absolute -left-[1.45rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--track)]" />
              <span className="font-semibold text-[var(--heading)]">{time(m.starts_at)}</span>
              <span className="ml-2">{m.title}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
