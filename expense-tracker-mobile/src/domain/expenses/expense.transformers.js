function normalizeExpenseDateValue(value) {
  if (value == null || value === "") return "";
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d] = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  if (typeof value === "string") return value.split("T")[0];
  return "";
}

export function normalizeExpenseDateForForm(value, fallback) {
  const normalized = normalizeExpenseDateValue(value);
  return normalized || fallback;
}

export function resolveExpenseFormCategoryFields(rawExpense, details) {
  const cat = details?.category ?? rawExpense?.category;
  if (cat && typeof cat === "object" && cat !== null && "id" in cat) {
    return {
      category: cat.id != null ? String(cat.id) : "",
      categoryName: cat.name || "",
    };
  }
  const fallbackId = rawExpense?.categoryId ?? details?.categoryId;
  if (fallbackId != null && fallbackId !== "") {
    return {
      category: String(fallbackId),
      categoryName: rawExpense?.categoryName || details?.categoryName || "",
    };
  }
  if (typeof cat === "string" || typeof cat === "number") {
    return { category: String(cat), categoryName: "" };
  }
  return {
    category: "",
    categoryName: rawExpense?.categoryName || details?.categoryName || "",
  };
}

export function normalizeExpenseSelectedState(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const categoryIsObject = raw.category && typeof raw.category === "object";
  const looksDetailed = raw.expenseName != null || categoryIsObject;
  if (!looksDetailed) return raw;
  const dateNorm = normalizeExpenseDateValue(raw.date);
  const categoryLabel = categoryIsObject
    ? raw.category.name || "-"
    : typeof raw.category === "string"
      ? raw.category
      : "-";
  return {
    ...raw,
    name: raw.name || raw.expenseName || "",
    date: dateNorm || raw.date,
    category: categoryLabel,
    isRecurring: Boolean(raw.isRecurring ?? raw.isBill),
  };
}

export function fromApiResponse(raw) {
  return {
    id: raw.id,
    name: raw.name || raw.itemName || "",
    amount: Number(raw.amount || 0),
    date: raw.date || raw.expenseDate || "",
    category: raw.category || raw.categoryName || "",
    categoryId: raw.categoryId || null,
    type: raw.type || "NEED",
    paymentMethod: raw.paymentMethod || "CASH",
    comments: raw.comments || raw.description || "",
    isRecurring: Boolean(raw.isRecurring || raw.recurring),
    recurringFrequency: raw.recurringFrequency || null,
    tags: raw.tags || [],
    createdAt: raw.createdAt || raw.created_at || "",
    updatedAt: raw.updatedAt || raw.updated_at || "",
  };
}

export function toApiPayload(formData) {
  return {
    name: formData.name?.trim(),
    amount: Number(formData.amount),
    date: formData.date,
    category: formData.category,
    type: formData.type,
    paymentMethod: formData.paymentMethod,
    comments: formData.comments?.trim() || "",
    isRecurring: formData.isRecurring || false,
    recurringFrequency: formData.isRecurring ? formData.recurringFrequency : null,
    tags: formData.tags || [],
  };
}

export function toListItem(expense) {
  return {
    id: expense.id,
    title: expense.name,
    subtitle: expense.category,
    amount: expense.amount,
    date: expense.date,
    type: expense.type,
    paymentMethod: expense.paymentMethod,
  };
}

export function toChartDataByCategory(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const cat = e.category || "Uncategorized";
    map[cat] = (map[cat] || 0) + Number(e.amount || 0);
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function toChartDataByPaymentMethod(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const method = e.paymentMethod || "Other";
    map[method] = (map[method] || 0) + Number(e.amount || 0);
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function toChartDataByDate(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const day = (e.date || "").split("T")[0];
    if (day) map[day] = (map[day] || 0) + Number(e.amount || 0);
  });
  return Object.entries(map)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function toDailySpendingAreaData(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const day = (e.date || "").split("T")[0];
    if (!day) return;
    const amount = Number(e.amount || 0);
    const type = e.type === "GAIN" ? "income" : "expense";
    if (!map[day]) map[day] = { date: day, income: 0, expense: 0, expenses: [] };
    map[day][type] += amount;
    map[day].expenses.push(e);
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

export function toCashFlowBarData(expenses, groupBy = "month") {
  const map = {};
  expenses.forEach((e) => {
    const day = (e.date || "").split("T")[0];
    if (!day) return;
    let key = day;
    if (groupBy === "month") key = day.slice(0, 7);
    else if (groupBy === "week") {
      const d = new Date(day);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().split("T")[0];
    }
    if (!map[key]) map[key] = { label: key, income: 0, expense: 0 };
    const amount = Number(e.amount || 0);
    if (e.type === "GAIN") map[key].income += amount;
    else map[key].expense += amount;
  });
  return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
}

export function toMonthlyTrendData(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const month = (e.date || "").split("T")[0]?.slice(0, 7);
    if (!month) return;
    if (!map[month]) map[month] = { label: month, total: 0, count: 0 };
    map[month].total += Number(e.amount || 0);
    map[month].count += 1;
  });
  const result = Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
  const avg = result.length ? result.reduce((s, r) => s + r.total, 0) / result.length : 0;
  return result.map((r) => ({ ...r, average: Math.round(avg) }));
}
