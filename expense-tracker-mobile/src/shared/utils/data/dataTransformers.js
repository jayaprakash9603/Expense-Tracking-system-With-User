export function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

export function sortBy(items, field, order = "asc") {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal) : aVal - bVal;
    return order === "desc" ? -cmp : cmp;
  });
}

export function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function paginate(items, page = 0, size = 20) {
  const start = page * size;
  return {
    data: items.slice(start, start + size),
    page,
    size,
    total: items.length,
    totalPages: Math.ceil(items.length / size),
    hasMore: start + size < items.length,
  };
}

export function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], fullKey));
    } else {
      acc[fullKey] = obj[key];
    }
    return acc;
  }, {});
}

export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) result[key] = obj[key];
    return result;
  }, {});
}

export function omit(obj, keys) {
  const keySet = new Set(keys);
  return Object.keys(obj).reduce((result, key) => {
    if (!keySet.has(key)) result[key] = obj[key];
    return result;
  }, {});
}

export function toCsv(items, columns) {
  if (!items.length) return "";
  const headers = columns.map((c) => c.label || c.key);
  const rows = items.map((item) => columns.map((c) => {
    const val = item[c.key];
    const str = val == null ? "" : String(val);
    return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  }));
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
