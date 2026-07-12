function localYmd(anchor, dayDelta) {
  const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + dayDelta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localIsoMidday(anchor, dayDelta) {
  const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + dayDelta, 12, 0, 0, 0);
  return d.toISOString();
}

function applyOffsets(node, anchor) {
  if (node == null || typeof node !== "object") return node;
  if (Array.isArray(node)) {
    return node.map((x) => applyOffsets(x, anchor));
  }
  const next = { ...node };

  if (typeof next.dateOffsetDays === "number") {
    next.date = localYmd(anchor, next.dateOffsetDays);
    delete next.dateOffsetDays;
  }
  if (typeof next.dueDateOffsetDays === "number") {
    next.dueDate = localYmd(anchor, next.dueDateOffsetDays);
    delete next.dueDateOffsetDays;
  }
  if (typeof next.dueInDays === "number") {
    next.dueDate = localYmd(anchor, next.dueInDays);
    delete next.dueInDays;
  }
  if (typeof next.startDateOffsetDays === "number") {
    next.startDate = localYmd(anchor, next.startDateOffsetDays);
    delete next.startDateOffsetDays;
  }
  if (typeof next.endDateOffsetDays === "number") {
    next.endDate = localYmd(anchor, next.endDateOffsetDays);
    delete next.endDateOffsetDays;
  }
  if (typeof next.createdAtOffsetDays === "number") {
    next.createdAt = localIsoMidday(anchor, next.createdAtOffsetDays);
    delete next.createdAtOffsetDays;
  }
  if (typeof next.updatedAtOffsetDays === "number") {
    next.updatedAt = localIsoMidday(anchor, next.updatedAtOffsetDays);
    delete next.updatedAtOffsetDays;
  }

  for (const k of Object.keys(next)) {
    const v = next[k];
    if (v != null && typeof v === "object") {
      next[k] = applyOffsets(v, anchor);
    }
  }
  return next;
}

export function hydrateRelativeDates(root, anchorDate = new Date()) {
  const anchor = new Date(anchorDate);
  if (Number.isNaN(anchor.getTime())) return root;
  const clone =
    typeof structuredClone === "function" ? structuredClone(root) : JSON.parse(JSON.stringify(root));
  return applyOffsets(clone, anchor);
}
