/** A dependency is overdue when its due date is before today (UTC) and it is not done. */
export function isOverdue(dueDate: string, status: string, today: Date = new Date()): boolean {
  if (status === "done") return false;
  return dueDate < today.toISOString().slice(0, 10);
}
