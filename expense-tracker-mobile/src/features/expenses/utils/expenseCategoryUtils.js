import {
  getFuzzyMatchIndices,
  scoreFuzzyMatch,
  compareFuzzyScores,
} from "./expenseFuzzyUtils";

export function deduplicateCategories(categories) {
  const list = Array.isArray(categories) ? categories : [];
  const byName = new Map();

  list.forEach((category) => {
    const key = String(category?.name || "").toLowerCase().trim();
    if (!key) return;
    if (!byName.has(key)) {
      byName.set(key, category);
    }
  });

  return Array.from(byName.values());
}

export function filterCategoriesWithDeduplication(options, inputValue) {
  if (!inputValue) return options;
  const list = Array.isArray(options) ? options : [];
  const seen = new Set();
  const ranked = [];

  list.forEach((option, index) => {
    const name = String(option?.name || "");
    const key = name.toLowerCase().trim();
    if (!key || seen.has(key)) return;

    const indices = getFuzzyMatchIndices(name, inputValue);
    if (!indices) return;

    seen.add(key);
    ranked.push({
      option,
      index,
      score: scoreFuzzyMatch(indices, name.length),
    });
  });

  ranked.sort((a, b) => compareFuzzyScores(a.score, b.score, a.index, b.index));
  return ranked.map((entry) => entry.option);
}

export function findExactCategoryMatch(categories, name) {
  if (!name || !Array.isArray(categories)) return null;
  return (
    categories.find(
      (category) =>
        String(category?.name || "").toLowerCase().trim() ===
        String(name).toLowerCase().trim(),
    ) || null
  );
}

export function findCategoryById(categories, id) {
  if (id == null || !Array.isArray(categories)) return null;
  return categories.find((category) => String(category.id) === String(id)) || null;
}

export function areCategoriesEqual(option, value) {
  if (!option || !value) return false;
  if (option.id != null && value.id != null) {
    return String(option.id) === String(value.id);
  }
  return String(option.name || "") === String(value.name || "");
}

export function getCategoryDisplayName(category) {
  return category?.name || "";
}
