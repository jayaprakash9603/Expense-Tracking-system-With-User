export function fromApiResponse(raw) {
  return {
    id: raw.id,
    name: raw.name || raw.billName || raw.title || "",
    amount: Number(raw.amount || 0),
    dueDate: raw.dueDate || raw.due_date || "",
    frequency: raw.frequency || "MONTHLY",
    category: raw.category || "",
    status: raw.status || "PENDING",
    autoPay: Boolean(raw.autoPay),
    reminderDays: Number(raw.reminderDays || 3),
    notes: raw.notes || "",
    lastPaidDate: raw.lastPaidDate || null,
    budgetId: raw.budgetId ?? null,
  };
}

export function toApiPayload(formData) {
  return {
    name: formData.name?.trim(),
    amount: Number(formData.amount),
    dueDate: formData.dueDate,
    frequency: formData.frequency,
    category: formData.category || null,
    status: formData.status,
    autoPay: formData.autoPay || false,
    reminderDays: Number(formData.reminderDays) || 3,
    notes: formData.notes?.trim() || "",
  };
}

export function toListItem(raw) {
  const bill = fromApiResponse(raw);
  return {
    id: bill.id,
    title: bill.name,
    subtitle: bill.category || bill.frequency,
    amount: bill.amount,
    dueDate: bill.dueDate,
    status: bill.status,
    isOverdue: bill.status === "OVERDUE",
  };
}
