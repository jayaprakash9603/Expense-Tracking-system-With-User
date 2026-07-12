function resolveBillDate(bill) {
  return bill.dueDate || bill.date || "";
}

export function isOverdue(bill) {
  if (bill.status === "PAID" || bill.status === "CANCELLED") return false;
  const d = resolveBillDate(bill);
  if (!d) return false;
  return new Date(d) < new Date(new Date().toDateString());
}

export function getDaysUntilDue(bill) {
  const now = new Date();
  const due = new Date(resolveBillDate(bill));
  if (Number.isNaN(due.getTime())) return 0;
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export function shouldRemind(bill) {
  if (bill.status !== "PENDING") return false;
  const daysUntil = getDaysUntilDue(bill);
  return daysUntil >= 0 && daysUntil <= (bill.reminderDays || 3);
}

export function getUpcomingBills(bills, days = 7) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return bills
    .filter((b) => b.status === "PENDING" && new Date(resolveBillDate(b)) <= cutoff)
    .sort((a, b) => new Date(resolveBillDate(a)) - new Date(resolveBillDate(b)));
}
