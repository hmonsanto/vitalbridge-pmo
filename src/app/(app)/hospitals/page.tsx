import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function HospitalsPage() {
  const supabase = await createClient();
  const { data: hospitals } = await supabase
    .from("projects")
    .select("id, name, scenario, current_phase")
    .eq("kind", "hospital")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--heading)]">Hospitals</h2>
      {(hospitals ?? []).length === 0 ? (
        <Card><p className="text-sm text-[var(--muted)]">No hospitals yet.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {hospitals!.map((h, i) => (
            <Link key={h.id} href={`/hospitals/${h.id}`}>
              <Card delay={i * 0.05} lift>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--heading)]">{h.name}</span>
                  <Badge tone="info">Scenario {h.scenario}</Badge>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">Phase {h.current_phase} of 6</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
                  <div
                    className="bar-fill h-full rounded-full"
                    style={{ width: `${(h.current_phase / 6) * 100}%` }}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
