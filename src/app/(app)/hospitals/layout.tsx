import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { ProjectTabs } from "@/components/shell/ProjectTabs";

export default async function HospitalsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data }, role] = await Promise.all([
    supabase.from("projects").select("id, name").eq("kind", "hospital").order("created_at"),
    getSessionRole(),
  ]);
  return (
    <>
      <ProjectTabs projects={data ?? []} canCreate={role === "owner"} />
      {children}
    </>
  );
}
