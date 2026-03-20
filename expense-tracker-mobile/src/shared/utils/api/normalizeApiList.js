export function normalizeApiList(data, ...keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

export function normalizeApiListOrObjectArrays(data, ...keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    const value = data?.[key];
    if (Array.isArray(value)) return value;
  }
  if (data && typeof data === "object") {
    return Object.values(data).filter(Array.isArray).flat();
  }
  return [];
}
