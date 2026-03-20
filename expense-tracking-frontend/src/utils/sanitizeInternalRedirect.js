export function sanitizeInternalRedirect(raw) {
  if (raw == null || typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return null;
  }
  if (/[\u0000-\u001F\\]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}
