export function applyFilters(items, filters = {}) {
  if (!items || !Array.isArray(items)) return [];
  if (!filters || Object.keys(filters).length === 0) return items;

  return items.filter((item) => {
    return Object.entries(filters).every(([key, config]) => {
      if (!config || (Array.isArray(config.value) && config.value.length === 0)) return true;
      if (config.value === undefined || config.value === null || config.value === "") return true;

      switch (config.type) {
        case "text":
          return matchText(item, config.fields || [key], config.value);
        case "exact":
          return item[key] === config.value;
        case "includes":
          return Array.isArray(config.value) ? config.value.includes(item[key]) : item[key] === config.value;
        case "dateRange":
          return matchDateRange(item[key], config.value);
        case "numberRange":
          return matchNumberRange(Number(item[key]), config.value);
        case "boolean":
          return Boolean(item[key]) === config.value;
        default:
          return String(item[key] || "").toLowerCase().includes(String(config.value).toLowerCase());
      }
    });
  });
}

function matchText(item, fields, query) {
  const q = String(query).toLowerCase();
  return fields.some((field) => {
    const val = item[field];
    return val && String(val).toLowerCase().includes(q);
  });
}

function matchDateRange(dateStr, range) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (range.start && date < new Date(range.start)) return false;
  if (range.end && date > new Date(range.end)) return false;
  return true;
}

function matchNumberRange(num, range) {
  if (isNaN(num)) return false;
  if (range.min !== undefined && num < range.min) return false;
  if (range.max !== undefined && num > range.max) return false;
  return true;
}

export function createTextFilter(fields, value) {
  return { type: "text", fields, value };
}

export function createDateRangeFilter(start, end) {
  return { type: "dateRange", value: { start, end } };
}

export function createNumberRangeFilter(min, max) {
  return { type: "numberRange", value: { min, max } };
}

export function createIncludesFilter(values) {
  return { type: "includes", value: values };
}
