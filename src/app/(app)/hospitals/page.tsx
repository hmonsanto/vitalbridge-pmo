import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function HospitalsPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: hospitals } = await supabase
    .from("projects")
    .select("id, name, scenario, current_phase")
    .eq("kind", "hospital")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--heading)]">Hospitals</h2>
        {role === "owner" && (
          <Link href="/hospitals/new" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
            New hospital
          </Link>
        )}
      </div>
      {(hospitals ?? []).length === 0 ? (
        <Card><p className="text-sm text-[var(--muted)]">No hospitals yet.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {hospitals!.map((h, i) => (
            <Link key={h.id} href={`/hospitals/${h.id}`}>
              <Card delay={i * 0.05} className="transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--heading)]">{h.name}</span>
                  <Badge tone="info">Scenario {h.scenario}</Badge>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">Phase {h.current_phase} of 6</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
