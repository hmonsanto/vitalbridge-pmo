import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";
import { signOut } from "@/app/(auth)/login/actions";
import { Badge } from "@/components/ui/Badge";
import { Sidebar } from "@/components/ui/Sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageTransition } from "@/components/ui/PageTransition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const role = await getSessionRole();
  if (!role) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--heading)]">VitalBridge RX PMO</h1>
        <div className="flex items-center gap-3">
          <Badge tone={role === "owner" ? "ok" : "info"}>{role === "owner" ? "Owner" : "Viewer"}</Badge>
          <ThemeToggle />
          <form action={signOut}>
            <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs">Sign out</button>
          </form>
        </div>
      </header>
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <Sidebar />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
