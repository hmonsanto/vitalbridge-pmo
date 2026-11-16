import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";
import { completionRate } from "@/domain/completion";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const role = await getSessionRole();
  if (!role) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.from("deliverables").select("status");
  const statuses = (data ?? []).map((d) => d.status as string);

  return (
    <AppShell
      role={role}
      completion={{
        percent: completionRate(statuses),
        done: statuses.filter((s) => s === "completed").length,
        total: statuses.length,
      }}
      signOutAction={signOut}
    >
      {children}
    </AppShell>
  );
}
