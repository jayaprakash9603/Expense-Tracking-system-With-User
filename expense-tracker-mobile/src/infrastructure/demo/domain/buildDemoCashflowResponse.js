import {
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isValid,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

function expenseYmd(expense) {
  const raw = String(expense?.date ?? "").split("T")[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function expenseFlowKind(expense) {
  const t = String(expense?.type ?? "").toLowerCase();
  if (["gain", "income", "inflow"].includes(t)) return "gain";
  return "loss";
}

function parseExpenseDay(expense) {
  const ymd = expenseYmd(expense);
  if (!ymd) return null;
  try {
    return parseISO(ymd);
  } catch {
    return null;
  }
}

function resolveCashflowWindow(range, offset, now) {
  const off = Number(offset) || 0;
  const ref = new Date(now);
  if (range === "week") {
    const w = addWeeks(ref, off);
    return {
      start: startOfWeek(w, { weekStartsOn: 1 }),
      end: endOfWeek(w, { weekStartsOn: 1 }),
    };
  }
  if (range === "year") {
    const y = addYears(ref, off);
    return { start: startOfYear(y), end: endOfYear(y) };
  }
  const m = addMonths(ref, off);
  return { start: startOfMonth(m), end: endOfMonth(m) };
}

function buildBucketDefs(range, start, end) {
  if (range === "year") {
    const out = [];
    let cur = startOfMonth(start);
    const last = endOfMonth(end);
    while (cur <= last) {
      out.push({
        bucketKey: format(cur, "yyyy-MM"),
        label: format(cur, "MMM"),
        month: format(cur, "MMM"),
      });
      cur = addMonths(cur, 1);
    }
    return out;
  }
  return eachDayOfInterval({ start, end }).map((d) => ({
    bucketKey: format(d, "yyyy-MM-dd"),
    label: format(d, "MMM d"),
    day: format(d, "EEE"),
  }));
}

function expenseBucketKey(range, day) {
  if (range === "year") return format(day, "yyyy-MM");
  return format(day, "yyyy-MM-dd");
}

function matchesFlowFilter(kind, params) {
  const t = params?.type;
  if (t === "gain") return kind === "gain";
  if (t === "loss") return kind === "loss";
  return true;
}

function parseYmdBoundary(value) {
  if (!value || typeof value !== "string") return null;
  const raw = value.split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  try {
    const d = parseISO(raw);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

function toCashflowExpenseRow(expense, kind) {
  return {
    id: expense.id,
    name: expense.name,
    amount: Math.abs(Number(expense.amount ?? 0)),
    date: expenseYmd(expense),
    categoryName: expense.categoryName || expense.category || "",
    category: expense.category || expense.categoryName || "",
    paymentMethod: expense.paymentMethod || "",
    type: kind === "gain" ? "gain" : "loss",
  };
}

export function buildDemoCashflowResponse(store, params = {}, now = new Date()) {
  const fromBoundary = parseYmdBoundary(params.startDate);
  const toBoundary = parseYmdBoundary(params.endDate);
  let range;
  let start;
  let end;
  let defs;

  if (fromBoundary && toBoundary && fromBoundary <= toBoundary) {
    range = "custom";
    start = fromBoundary;
    end = toBoundary;
    defs = eachDayOfInterval({ start, end }).map((d) => ({
      bucketKey: format(d, "yyyy-MM-dd"),
      label: format(d, "MMM d"),
      day: format(d, "EEE"),
    }));
  } else {
    range = params.range === "week" || params.range === "year" ? params.range : "month";
    const resolved = resolveCashflowWindow(range, params.offset, now);
    start = resolved.start;
    end = resolved.end;
    defs = buildBucketDefs(range, start, end);
  }

  const bucketMap = new Map(defs.map((d) => [d.bucketKey, { ...d, expenses: [] }]));

  for (const expense of store.expenses || []) {
    const day = parseExpenseDay(expense);
    if (!day) continue;
    if (!isWithinInterval(day, { start, end })) continue;
    const kind = expenseFlowKind(expense);
    if (!matchesFlowFilter(kind, params)) continue;
    const key =
      range === "custom" || range === "month" || range === "week"
        ? format(day, "yyyy-MM-dd")
        : expenseBucketKey(range, day);
    const bucket = bucketMap.get(key);
    if (!bucket) continue;
    bucket.expenses.push(toCashflowExpenseRow(expense, kind));
  }

  const chartData = defs.map((d) => {
    const b = bucketMap.get(d.bucketKey);
    return {
      isoDate: d.bucketKey,
      label: d.label,
      day: d.day,
      month: d.month,
      expenses: b?.expenses ?? [],
    };
  });

  return { chartData };
}
