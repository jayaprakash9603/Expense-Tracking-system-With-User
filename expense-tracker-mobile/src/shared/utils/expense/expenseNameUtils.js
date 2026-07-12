export function normalizeName(name) {
  if (!name || typeof name !== "string") return "";
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

export function deduplicateNames(names) {
  if (!Array.isArray(names)) return [];
  const seen = new Map();
  const unique = [];

  names.forEach((name) => {
    if (!name || typeof name !== "string") return;
    const normalized = normalizeName(name);
    if (!seen.has(normalized)) {
      seen.set(normalized, true);
      unique.push(name.trim());
    }
  });

  return unique;
}

export function filterNamesByQuery(names, query) {
  if (!Array.isArray(names)) return [];
  if (!query || typeof query !== "string") return names;
  const normalizedQuery = normalizeName(query);
  return names.filter((name) => normalizeName(name).includes(normalizedQuery));
}

export function getSuggestions(names, inputValue, maxSuggestions = 50) {
  if (!Array.isArray(names)) return [];
  if (!inputValue || inputValue.trim() === "") return names.slice(0, maxSuggestions);
  return filterNamesByQuery(names, inputValue).slice(0, maxSuggestions);
}

export function findExactNameMatch(names, query) {
  if (!Array.isArray(names) || !query) return null;
  const normalizedQuery = normalizeName(query);
  return names.find((name) => normalizeName(name) === normalizedQuery) || null;
}

export function areNamesEqual(nameA, nameB) {
  return normalizeName(nameA) === normalizeName(nameB);
}

export function sanitizeName(name, maxLength = 255) {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
}

export function getNameDisplayLabel(option) {
  if (!option) return "";
  if (typeof option === "string") return option;
  if (typeof option === "object") {
    return option.name || option.label || option.expenseName || option.billName || "";
  }
  return String(option);
}
