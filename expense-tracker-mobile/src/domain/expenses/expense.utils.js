export function extractExpenseDetails(raw) {
  if (!raw || typeof raw !== "object") return {};
  return raw.expense || raw.details || raw;
}
