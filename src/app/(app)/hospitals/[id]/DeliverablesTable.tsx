import { DeleteButton } from "@/components/ui/DeleteButton";
import { Dialog } from "@/components/ui/Dialog";
import { StatusPill } from "@/components/ui/StatusPill";
import { EditDeliverableForm } from "@/components/edit/EditForms";
import { isHttpUrl } from "@/lib/url";
import { deleteDeliverable } from "../edit-actions";
import { StatusSelect } from "./StatusSelect";

export type DeliverableRow = {
  id: string;
  phase: number;
  name: string;
  owner: string | null;
  status: string;
  doc_url: string | null;
  remarks: string | null;
};

export function DeliverablesTable({ projectId, rows, editable }: { projectId: string; rows: DeliverableRow[]; editable: boolean }) {
  if (rows.length === 0) return <p className="text-sm text-[var(--muted)]">No deliverables yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="py-2 pr-3">Phase</th>
            <th className="pr-3">Name</th>
            <th className="pr-3">Owner</th>
            <th className="pr-3">Status</th>
            <th className="pr-3">Document</th>
            <th>Remarks</th>
            {editable && (
              <th>
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="row-hover border-t border-[var(--border)]">
              <td className="py-2 pr-3">{r.phase}</td>
              <td className="pr-3 font-medium">{r.name}</td>
              <td className="pr-3">{r.owner ?? "—"}</td>
              <td className="pr-3">
                {editable ? (
                  <StatusSelect projectId={projectId} deliverableId={r.id} status={r.status} />
                ) : (
                  <StatusPill status={r.status} />
                )}
              </td>
              <td className="pr-3">
                {r.doc_url && isHttpUrl(r.doc_url) ? (
                  <a href={r.doc_url} target="_blank" rel="noopener noreferrer" className="text-[var(--link)] underline">
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="pr-3 text-[var(--muted)]">{r.remarks ?? ""}</td>
              {editable && (
                <td className="whitespace-nowrap text-right">
                  <span className="inline-flex items-center gap-0.5">
                    <Dialog icon="edit" triggerLabel={`Edit deliverable ${r.name}`} title="Edit deliverable">
                      <EditDeliverableForm projectId={projectId} row={r} />
                    </Dialog>
                    <DeleteButton label={`deliverable ${r.name}`} action={deleteDeliverable.bind(null, projectId, r.id)} />
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
