export function normalizeName(name) {
  if (!name || typeof name !== "string") return "";
  return name.replace(/\s+/g, " ").trim();
}

export function formatNameForDisplay(name) {
  const normalized = normalizeName(name);
  if (!normalized) return "";
  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function isValidName(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100 && /^[a-zA-Z\s'-]+$/.test(trimmed);
}

export function filterNamesByQuery(names, query) {
  if (!query || !Array.isArray(names)) return names;
  const lowerQuery = query.toLowerCase().trim();
  return names.filter((name) => (name || "").toLowerCase().includes(lowerQuery));
}

export function sortNames(names, direction = "asc") {
  if (!Array.isArray(names)) return [];
  return [...names].sort((a, b) => {
    const comparison = (a || "").localeCompare(b || "");
    return direction === "asc" ? comparison : -comparison;
  });
}

export function deduplicateNames(names) {
  if (!Array.isArray(names)) return [];
  const seen = new Set();
  return names.filter((name) => {
    const key = normalizeName(name).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getSuggestions(names, query, limit = 5) {
  return filterNamesByQuery(names, query).slice(0, limit);
}

export function sanitizeName(name) {
  if (!name || typeof name !== "string") return "";
  return name.replace(/[^a-zA-Z\s'-]/g, "").replace(/\s+/g, " ").trim();
}
