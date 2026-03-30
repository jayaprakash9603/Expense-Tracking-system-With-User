import {
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isValid,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

function parseBoundary(v) {
  if (v == null) return null;
  const raw = String(v).split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = parseISO(raw);
  return isValid(d) ? d : null;
}

export function flowWindowFromParams(params, now = new Date()) {
  const fd = parseBoundary(params.fromDate);
  const td = parseBoundary(params.toDate);
  if (fd && td && fd <= td) {
    return { start: startOfDay(fd), end: endOfDay(td) };
  }
  const rt = String(params.rangeType || "month").toLowerCase();
  const off = Number(params.offset) || 0;
  const ref = new Date(now);
  if (rt === "custom") {
    const end = startOfDay(ref);
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    return { start: startOfDay(start), end: endOfDay(end) };
  }
  if (rt === "week") {
    const w = addWeeks(ref, off);
    return { start: startOfWeek(w, { weekStartsOn: 1 }), end: endOfWeek(w, { weekStartsOn: 1 }) };
  }
  if (rt === "year") {
    const y = addYears(ref, off);
    return { start: startOfYear(y), end: endOfYear(y) };
  }
  const m = addMonths(ref, off);
  return { start: startOfMonth(m), end: endOfMonth(m) };
}

function flowParamsKind(params) {
  const t = String(params.type || "").toLowerCase();
  if (t === "gain") return "gain";
  if (t === "loss") return "loss";
  const f = String(params.flowType || "").toLowerCase();
  if (f === "inflow") return "gain";
  if (f === "outflow") return "loss";
  return null;
}

function expenseNormalizedFlow(e) {
  const t = String(e.type || "").toLowerCase();
  if (t === "gain" || t === "income") return "gain";
  if (t === "loss" || t === "expense" || t === "need" || t === "want") return "loss";
  return "loss";
}

function expenseMatchesKind(e, kind) {
  if (!kind) return true;
  const fk = expenseNormalizedFlow(e);
  return kind === "gain" ? fk === "gain" : fk === "loss";
}

function expenseInWindow(e, start, end) {
  const ymd = String(e.date || "").split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const d = parseISO(ymd);
  if (!isValid(d)) return false;
  return isWithinInterval(d, { start, end });
}

function collectFilteredFlowExpenses(store, params, now) {
  const { start, end } = flowWindowFromParams(params, now);
  const kind = flowParamsKind(params);
  const expenses = (store.expenses || []).filter(
    (e) => expenseInWindow(e, start, end) && expenseMatchesKind(e, kind),
  );
  return { start, end, expenses };
}

function resolvePmEntity(expense, paymentMethods) {
  const raw = String(expense.paymentMethod || "");
  const list = paymentMethods || [];
  const byName = list.find((p) => String(p.name) === raw);
  if (byName) return byName;
  return list.find((p) => String(p.type || "").toUpperCase() === raw.toUpperCase()) || null;
}

function paymentMethodBucketKey(expense, paymentMethods) {
  const pm = resolvePmEntity(expense, paymentMethods);
  return pm?.name || String(expense.paymentMethod || "Unknown");
}

function expenseApiType(e) {
  return expenseNormalizedFlow(e) === "gain" ? "gain" : "loss";
}

function toFlowExpenseRow(e, category, pmEntity) {
  const apiType = expenseApiType(e);
  const pmName = pmEntity?.name || String(e.paymentMethod || "");
  const dateStr = String(e.date || "").split("T")[0];
  return {
    id: e.id,
    date: dateStr,
    amount: Math.abs(Number(e.amount ?? 0)),
    type: apiType,
    name: e.name,
    expenseName: e.name,
    paymentMethod: pmName,
    comments: e.comments || "",
    categoryId: e.categoryId,
    categoryName: category?.name || e.categoryName || "",
    category: category
      ? { id: category.id, name: category.name, color: category.color, type: category.type }
      : e.categoryName || "",
    expense: {
      expenseName: e.name,
      amount: Number(e.amount ?? 0),
      type: apiType,
      paymentMethod: pmName,
      comments: e.comments || "",
      date: dateStr,
    },
  };
}

function summaryDateRange(params, start, end) {
  const fromStr = format(start, "yyyy-MM-dd");
  const toStr = format(end, "yyyy-MM-dd");
  const flow = params.flowType ?? params.type ?? null;
  if (params.fromDate && params.toDate) {
    return { fromDate: fromStr, toDate: toStr, flowType: flow };
  }
  return {
    startDate: fromStr,
    endDate: toStr,
    rangeType: params.rangeType ?? null,
    offset: Number(params.offset) || 0,
    flowType: flow != null ? flow : "all",
  };
}

function fillCategoryResponse(response, byName, start, end, params) {
  let totalExpenses = 0;
  let totalAmount = 0;
  const categoryTotals = {};
  for (const [name, { cat, list }] of byName) {
    const categoryTotal = list.reduce((a, x) => a + Math.abs(Number(x.amount ?? 0)), 0);
    totalExpenses += list.length;
    totalAmount += categoryTotal;
    categoryTotals[name] = categoryTotal;
    response[name] = {
      id: cat?.id ?? name,
      name: cat?.name ?? name,
      description: cat?.description ?? "",
      isGlobal: Boolean(cat?.isGlobal),
      color: cat?.color,
      icon: cat?.icon ?? null,
      userIds: cat?.userIds ?? [],
      editUserIds: cat?.editUserIds ?? [],
      expenseIds: cat?.expenseIds ?? null,
      expenses: list,
      totalAmount: categoryTotal,
      expenseCount: list.length,
    };
  }
  response.summary = {
    totalCategories: Object.keys(categoryTotals).length,
    totalExpenses,
    totalAmount,
    categoryTotals,
    dateRange: summaryDateRange(params, start, end),
  };
}

function fillPaymentMethodResponse(response, byKey, pms, start, end, params) {
  let totalExpenses = 0;
  let totalAmount = 0;
  const paymentMethodTotals = {};
  for (const [key, list] of byKey) {
    const methodTotal = list.reduce((a, x) => a + Math.abs(Number(x.amount ?? 0)), 0);
    totalExpenses += list.length;
    totalAmount += methodTotal;
    paymentMethodTotals[key] = methodTotal;
    const pmEntity = pms.find((p) => String(p.name) === String(key)) || null;
    response[key] = {
      id: pmEntity?.id ?? null,
      name: pmEntity?.name ?? key,
      paymentMethod: key,
      description: pmEntity?.description ?? "",
      isGlobal: Boolean(pmEntity?.isGlobal),
      icon: pmEntity?.icon ?? "",
      color: pmEntity?.color ?? "",
      editUserIds: pmEntity?.editUserIds ?? [],
      userIds: pmEntity?.userIds ?? [],
      expenseCount: list.length,
      totalAmount: methodTotal,
      expenses: list,
    };
  }
  response.summary = {
    totalPaymentMethods: Object.keys(paymentMethodTotals).length,
    totalExpenses,
    totalAmount,
    paymentMethodTotals,
    dateRange: summaryDateRange(params, start, end),
  };
}

export function buildDemoCategoryDetailedResponse(store, params = {}, now = new Date()) {
  const { start, end, expenses } = collectFilteredFlowExpenses(store, params, now);
  const cats = store.categories || [];
  const pms = store.paymentMethods || [];
  const byName = new Map();
  for (const e of expenses) {
    const cat = cats.find((c) => String(c.id) === String(e.categoryId));
    const name = cat?.name || e.categoryName || "Uncategorized";
    if (!byName.has(name)) byName.set(name, { cat, list: [] });
    const pm = resolvePmEntity(e, pms);
    byName.get(name).list.push(toFlowExpenseRow(e, cat, pm));
  }
  const response = {};
  fillCategoryResponse(response, byName, start, end, params);
  return response;
}

export function buildDemoPaymentMethodDetailedResponse(store, params = {}, now = new Date()) {
  const { start, end, expenses } = collectFilteredFlowExpenses(store, params, now);
  const cats = store.categories || [];
  const pms = store.paymentMethods || [];
  const byKey = new Map();
  for (const e of expenses) {
    const key = paymentMethodBucketKey(e, pms);
    if (!byKey.has(key)) byKey.set(key, []);
    const cat = cats.find((c) => String(c.id) === String(e.categoryId));
    const pmEntity = resolvePmEntity(e, pms);
    byKey.get(key).push(toFlowExpenseRow(e, cat, pmEntity));
  }
  const response = {};
  fillPaymentMethodResponse(response, byKey, pms, start, end, params);
  return response;
}
