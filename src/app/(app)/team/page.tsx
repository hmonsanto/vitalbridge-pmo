import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { initials } from "@/domain/person";
import { isAdmin, parseRole, roleLabel } from "@/domain/roles";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { MemberActions, RoleSelect } from "./MemberControls";

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  mfa_enabled: boolean;
};

const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never";

export default async function TeamPage() {
  const session = await getSession();
  if (!isAdmin(session?.role)) redirect("/");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("team_members");
  const members = ((data ?? []) as Member[]).map((m) => ({ ...m, role: parseRole(m.role) ?? "viewer" }));
  const active = members.filter((m) => !m.banned);
  const count = (role: string) => active.filter((m) => m.role === role).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--heading)]">Team</h2>
        <p data-testid="team-summary" className="mt-1 text-sm text-[var(--muted)]">
          {active.length} active · {count("owner")} admin{count("owner") === 1 ? "" : "s"} · {count("editor")} editor
          {count("editor") === 1 ? "" : "s"} · {count("viewer")} viewer{count("viewer") === 1 ? "" : "s"}
        </p>
      </div>

      <Card title="People">
        {error ? (
          <p role="alert" className="text-sm font-medium text-rose-600">Could not load the team. Reload the page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="py-2 pr-3">Person</th>
                  <th className="pr-3">Role</th>
                  <th className="pr-3">Two-step</th>
                  <th className="pr-3">Last sign-in</th>
                  <th className="pr-3">Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const shown = m.full_name?.trim() || m.email.split("@")[0];
                  const isSelf = m.id === session?.userId;
                  return (
                    <tr key={m.id} data-member={m.email} className={`row-hover border-t border-[var(--border)] ${m.banned ? "opacity-60" : ""}`}>
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#6b1f2a] text-xs font-bold text-white"
                          >
                            {initials(shown)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {shown}
                              {isSelf && <span className="ml-1.5 text-xs font-normal text-[var(--muted)]">(you)</span>}
                            </span>
                            <span className="block truncate text-xs text-[var(--muted)]">{m.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="pr-3">
                        {isSelf ? (
                          <span className="text-xs font-semibold">{roleLabel(m.role)}</span>
                        ) : (
                          <RoleSelect userId={m.id} name={shown} role={m.role} />
                        )}
                      </td>
                      <td className="pr-3">
                        {m.mfa_enabled ? (
                          <Badge tone="ok">On</Badge>
                        ) : m.role === "viewer" ? (
                          <Badge tone="info">Off</Badge>
                        ) : (
                          <Badge tone="warn">Not set up</Badge>
                        )}
                      </td>
                      <td className="pr-3 text-xs">{day(m.last_sign_in_at)}</td>
                      <td className="pr-3">
                        <Badge tone={m.banned ? "danger" : "ok"}>{m.banned ? "Deactivated" : "Active"}</Badge>
                      </td>
                      <td className="text-right">
                        <MemberActions
                          userId={m.id}
                          name={shown}
                          hasName={Boolean(m.full_name?.trim())}
                          banned={m.banned}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Add a person" delay={0.1}>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>
            In the Supabase dashboard open <strong>Authentication → Users → Add user → Create new user</strong>. Enter their
            email and a temporary password, and tick <strong>Auto Confirm User</strong>.
          </li>
          <li>
            Come back and reload this page. They appear as a <strong>Viewer</strong>: set their name and, if they need to
            change data, their role.
          </li>
          <li>
            Send them the address and the temporary password through a safe channel, and ask them to change the password in
            <strong> Account</strong>. Admins and editors are asked to set up two-step verification the first time they sign in.
          </li>
        </ol>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Roles: <strong>Admin</strong> manages people and everything else · <strong>Editor</strong> creates and edits project
          data · <strong>Viewer</strong> only reads.
        </p>
      </Card>
    </div>
  );
}
