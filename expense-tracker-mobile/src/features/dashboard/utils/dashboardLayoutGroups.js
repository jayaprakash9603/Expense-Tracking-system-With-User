export function buildDashboardLayoutGroups(visibleSections) {
  const groups = [];
  let currentRow = null;

  visibleSections.forEach((section) => {
    if (section.type === "full") {
      if (currentRow) {
        groups.push(currentRow);
        currentRow = null;
      }
      groups.push({ type: "full", sections: [section] });
    } else {
      if (!currentRow) currentRow = { type: "row", sections: [] };
      currentRow.sections.push(section);
      if (currentRow.sections.length >= 2) {
        groups.push(currentRow);
        currentRow = null;
      }
    }
  });

  if (currentRow) groups.push(currentRow);
  return groups;
}

export function getDashboardRowCols(sections) {
  if (sections.length === 1) return "grid-cols-1";
  const ids = sections.map((s) => s.id);
  if (ids.includes("recent-transactions") && ids.includes("budget-overview")) {
    return "grid-cols-1 lg:grid-cols-3";
  }
  return "grid-cols-1 lg:grid-cols-2";
}

export function getDashboardColSpan(section, sections) {
  if (sections.length < 2) return "";
  const ids = sections.map((s) => s.id);
  if (ids.includes("recent-transactions") && ids.includes("budget-overview")) {
    return section.id === "recent-transactions" ? "lg:col-span-2" : "lg:col-span-1";
  }
  return "";
}
