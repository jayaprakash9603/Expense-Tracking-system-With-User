export function getGroupExpenseRows(group) {
  if (Array.isArray(group.items)) return group.items;
  return Array.isArray(group.expenses) ? group.expenses : [];
}

export function getAllSelectableExpenseIds(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.flatMap((group) => getGroupExpenseRows(group).map((row) => row.id));
}

export function isEveryGroupRowSelected(group, selectedGlobalIds) {
  const rows = getGroupExpenseRows(group);
  if (rows.length === 0) return false;
  return rows.every((row) => selectedGlobalIds.includes(row.id));
}

export function mergeCheckboxSelectionForGroup(checked, group, selectedGlobalIds) {
  const ids = getGroupExpenseRows(group).map((row) => row.id);
  if (checked) {
    return [...new Set([...selectedGlobalIds, ...ids])];
  }
  return selectedGlobalIds.filter((id) => !ids.includes(id));
}

export function buildTableRowSelectionMap(rows, selectedGlobalIds) {
  return rows.reduce((acc, row) => {
    if (selectedGlobalIds.includes(row.id)) {
      acc[row.id] = true;
    }
    return acc;
  }, {});
}

export function mergeTableRowSelection(state, filteredRows, selectedGlobalIds, onSelectionChange) {
  const selectedInGroup = filteredRows.filter((row) => state[String(row.id)]).map((row) => row.id);
  const otherGroups = selectedGlobalIds.filter(
    (id) => !filteredRows.some((row) => String(row.id) === String(id)),
  );
  onSelectionChange([...new Set([...otherGroups, ...selectedInGroup])]);
}
