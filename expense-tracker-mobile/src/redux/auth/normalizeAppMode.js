export function normalizeAppMode(value) {
  const s = String(value ?? "USER").trim().toUpperCase();
  return s === "ADMIN" ? "ADMIN" : "USER";
}
