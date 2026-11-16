import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";
import { NewHospitalForm } from "./NewHospitalForm";

export default async function NewHospitalPage() {
  if ((await getSessionRole()) !== "owner") redirect("/hospitals");
  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-xl font-bold text-[var(--heading)]">New hospital</h2>
      <NewHospitalForm />
    </div>
  );
}
