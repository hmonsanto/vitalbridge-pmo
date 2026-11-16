import { redirect } from "next/navigation";

/** To-dos now live in the calendar page; this keeps old links and bookmarks working. */
export default function TodosPage() {
  redirect("/calendar");
}
