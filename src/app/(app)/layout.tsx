import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";
import { completionRate } from "@/domain/completion";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // Independent lookups run together instead of one after the other.
  const [session, deliverables, codes] = await Promise.all([
    getSession(),
    supabase.from("deliverables").select("status"),
    supabase.rpc("recovery_codes_remaining"),
  ]);
  if (!session?.role) redirect("/login");

  const statuses = (deliverables.data ?? []).map((d) => d.status as string);

  return (
    <AppShell
      user={{ name: session.name, role: session.role, hasName: session.hasName }}
      completion={{
        percent: completionRate(statuses),
        done: statuses.filter((s) => s === "completed").length,
        total: statuses.length,
      }}
      signOutAction={signOut}
      recoveryReminder={session.role === "owner" && codes.data === 0}
    >
      {children}
    </AppShell>
  );
}
