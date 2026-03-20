import { recalculateBudgetSpent } from "@/infrastructure/demo/domain/demoBudgetAccounting";
import { nextDemoId, saveDemoStore } from "@/infrastructure/demo/store/demoStore";
import { buildDemoCashflowResponse } from "@/infrastructure/demo/domain/buildDemoCashflowResponse";
import {
  buildCategoryDistribution,
  buildPaymentMethodDistribution,
  mapExpenseOut,
  matchExpenseDelete,
  matchExpenseEdit,
  matchExpenseIdFromDetailed,
} from "@/infrastructure/demo/handlers/demoEntityHelpers";

function tryExpenseListAndDetail(ctx) {
  const { method, path, store, resolveDemoData, rejectDemoHttp } = ctx;

  if (method === "GET" && path === "/api/expenses/fetch-expenses") {
    return resolveDemoData([...store.expenses]);
  }

  if (method === "GET" && path === "/api/expenses/fetch-expenses-paginated") {
    return resolveDemoData({
      content: [...store.expenses],
      number: 0,
      totalPages: 1,
      totalElements: store.expenses.length,
      last: true,
    });
  }

  const detailedId = matchExpenseIdFromDetailed(path);
  if (method === "GET" && detailedId) {
    const found = store.expenses.find((e) => String(e.id) === String(detailedId));
    if (!found) return rejectDemoHttp(404, "Expense not found");
    return resolveDemoData(mapExpenseOut(found, store.categories));
  }

  return null;
}

function extractExpensePayload(body, prev = null) {
  const nested = body?.expense && typeof body.expense === "object" ? body.expense : null;
  const src = nested || body || {};
  const name = src.expenseName ?? src.name ?? body?.name ?? prev?.name ?? "";
  const amountRaw = src.amount ?? body?.amount ?? prev?.amount;
  const dateRaw = body?.date ?? src.date ?? src.expenseDate ?? prev?.date;
  const categoryRaw =
    body?.categoryId ??
    src.categoryId ??
    src.category ??
    body?.category ??
    prev?.categoryId;
  const budgetSource = body?.budgetIds ?? prev?.budgetIds;
  const budgetIds = Array.isArray(budgetSource) ? budgetSource.map(String) : [];
  return {
    name: String(name || "").trim() || "Expense",
    amount: Number(amountRaw ?? 0),
    date: String(dateRaw || new Date().toISOString()).split("T")[0],
    categoryId: categoryRaw != null ? String(categoryRaw) : "",
    paymentMethod: String(
      src.paymentMethod ?? body?.paymentMethod ?? prev?.paymentMethod ?? "CASH",
    ),
    type: String(src.type ?? body?.type ?? prev?.type ?? "NEED"),
    comments: String(
      src.comments ?? body?.comments ?? src.description ?? prev?.comments ?? "",
    ),
    budgetIds,
    isRecurring: Boolean(src.isRecurring ?? body?.isRecurring ?? prev?.isRecurring),
  };
}

function createExpenseFromBody(store, body, id) {
  const p = extractExpensePayload(body);
  const cat = store.categories.find((c) => String(c.id) === String(p.categoryId));
  return {
    id,
    name: p.name,
    amount: p.amount,
    date: p.date,
    categoryId: cat?.id || p.categoryId || "",
    categoryName: cat?.name || "",
    category: cat?.name || "",
    type: p.type,
    paymentMethod: p.paymentMethod,
    comments: p.comments,
    isRecurring: p.isRecurring,
    budgetIds: p.budgetIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mergeExpenseUpdate(store, prev, body) {
  const p = extractExpensePayload(body, prev);
  const cat = store.categories.find((c) => String(c.id) === String(p.categoryId));
  return {
    ...prev,
    id: prev.id,
    name: p.name,
    amount: p.amount,
    date: p.date,
    categoryId: cat?.id || p.categoryId || prev.categoryId,
    categoryName: cat?.name || prev.categoryName,
    category: cat?.name || prev.category,
    type: p.type,
    paymentMethod: p.paymentMethod,
    comments: p.comments,
    isRecurring: p.isRecurring,
    budgetIds: p.budgetIds,
    updatedAt: new Date().toISOString(),
  };
}

function tryExpenseMutations(ctx) {
  const { method, path, body, store, resolveDemoData, rejectDemoHttp } = ctx;

  if (method === "POST" && path === "/api/expenses/add-expense") {
    const row = createExpenseFromBody(store, body, nextDemoId(store));
    store.expenses = [row, ...store.expenses];
    recalculateBudgetSpent(store);
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  const editId = matchExpenseEdit(path);
  if (method === "PUT" && editId) {
    const idx = store.expenses.findIndex((e) => String(e.id) === String(editId));
    if (idx === -1) return rejectDemoHttp(404, "Expense not found");
    const row = mergeExpenseUpdate(store, store.expenses[idx], body);
    store.expenses = [...store.expenses.slice(0, idx), row, ...store.expenses.slice(idx + 1)];
    recalculateBudgetSpent(store);
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  const delId = matchExpenseDelete(path);
  if (method === "DELETE" && delId) {
    store.expenses = store.expenses.filter((e) => String(e.id) !== String(delId));
    recalculateBudgetSpent(store);
    saveDemoStore(store);
    return resolveDemoData({ success: true });
  }

  return null;
}

function tryExpenseAggregates(ctx) {
  const { method, path, store, resolveDemoData, config } = ctx;

  if (method === "GET" && path === "/api/expenses/cashflow") {
    const params = config?.params && typeof config.params === "object" ? config.params : {};
    return resolveDemoData(buildDemoCashflowResponse(store, params));
  }

  if (method === "GET" && path === "/api/expenses/summary-expenses") {
    const total = store.expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
    return resolveDemoData({ totalAmount: total, count: store.expenses.length });
  }

  if ((method === "POST" || method === "GET") && path === "/api/expenses/top-expense-names") {
    const topExpenses = store.expenses.map((e) => ({
      name: e.name,
      expenseName: e.name,
    }));
    return resolveDemoData({ topExpenses, data: topExpenses, items: topExpenses });
  }

  if (method === "GET" && path === "/api/expenses/groupedByDate") {
    const byDate = new Map();
    for (const e of store.expenses) {
      const d = String(e.date || "").split("T")[0];
      if (!d) continue;
      if (!byDate.has(d)) byDate.set(d, []);
      byDate.get(d).push(e);
    }
    const rows = [...byDate.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, expenses]) => ({ date, expenses }));
    return resolveDemoData(rows);
  }

  if (method === "GET" && path === "/api/expenses/all-by-categories/detailed/filtered") {
    return resolveDemoData(buildCategoryDistribution(store));
  }

  if (method === "GET" && path === "/api/expenses/all-by-payment-method/detailed/filtered") {
    return resolveDemoData(buildPaymentMethodDistribution(store));
  }

  return null;
}

export async function tryDemoExpenseRoutes(ctx) {
  return (
    tryExpenseListAndDetail(ctx) ||
    tryExpenseMutations(ctx) ||
    tryExpenseAggregates(ctx) ||
    null
  );
}
