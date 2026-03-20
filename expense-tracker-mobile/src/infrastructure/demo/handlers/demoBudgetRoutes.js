import { recalculateBudgetSpent } from "@/infrastructure/demo/domain/demoBudgetAccounting";
import { nextDemoId, saveDemoStore } from "@/infrastructure/demo/store/demoStore";
import {
  mapExpenseOut,
  matchBudgetExpensesPath,
  matchBudgetId,
} from "@/infrastructure/demo/handlers/demoEntityHelpers";

function isBudgetActiveOnDate(budget, dateStr) {
  if (!dateStr) return true;
  const d = String(dateStr).split("T")[0];
  const s = budget.startDate ? String(budget.startDate).split("T")[0] : null;
  const e = budget.endDate ? String(budget.endDate).split("T")[0] : null;
  if (s && d < s) return false;
  if (e && d > e) return false;
  return true;
}

function toBudgetPickerRow(budget, extra = {}) {
  return {
    id: budget.id,
    name: budget.name,
    budgetName: budget.name,
    description: budget.description || "",
    amount: Number(budget.amount || 0),
    spent: Number(budget.spent || 0),
    spentAmount: Number(budget.spent || 0),
    startDate: budget.startDate || "",
    endDate: budget.endDate || "",
    period: budget.period || "MONTHLY",
    categories: budget.categories || [],
    ...extra,
  };
}

export async function tryDemoBudgetRoutes(ctx) {
  const { method, path, body, store, config, resolveDemoData, rejectDemoHttp } = ctx;

  if (method === "GET" && path === "/api/budgets") {
    return resolveDemoData([...store.budgets]);
  }

  if (method === "GET" && path === "/api/budgets/overview") {
    const total = store.budgets.reduce((a, b) => a + Number(b.amount || 0), 0);
    const spent = store.budgets.reduce((a, b) => a + Number(b.spent || 0), 0);
    return resolveDemoData({
      totalBudgets: store.budgets.length,
      totalAmount: total,
      totalSpent: spent,
    });
  }

  if (method === "GET" && path === "/api/budgets/filter-by-date") {
    const dateStr = config?.params?.date || "";
    const rows = store.budgets
      .filter((b) => isBudgetActiveOnDate(b, dateStr))
      .map((b) => toBudgetPickerRow(b, { includeInBudget: false }));
    return resolveDemoData({ budgets: rows, content: rows });
  }

  if (method === "GET" && path === "/api/budgets/expenses") {
    const expenseId = config?.params?.expenseId;
    const dateStr = config?.params?.date || "";
    const expense = store.expenses.find((x) => String(x.id) === String(expenseId));
    const linked = new Set(
      Array.isArray(expense?.budgetIds) ? expense.budgetIds.map(String) : [],
    );
    const rows = store.budgets
      .filter((b) => isBudgetActiveOnDate(b, dateStr))
      .map((b) => toBudgetPickerRow(b, { includeInBudget: linked.has(String(b.id)) }));
    return resolveDemoData({ budgets: rows, content: rows });
  }

  const budgetForExpenses = matchBudgetExpensesPath(path);
  if (method === "GET" && budgetForExpenses) {
    const b = store.budgets.find((x) => String(x.id) === String(budgetForExpenses));
    if (!b) return rejectDemoHttp(404, "Budget not found");
    const list = store.expenses.filter(
      (e) => Array.isArray(e.budgetIds) && e.budgetIds.map(String).includes(String(b.id)),
    );
    return resolveDemoData(list.map((e) => mapExpenseOut(e, store.categories)));
  }

  if (method === "POST" && path === "/api/budgets") {
    const id = nextDemoId(store);
    const cats = body.categories || [];
    const row = {
      id,
      name: body.name || "Budget",
      amount: Number(body.amount || 0),
      spent: 0,
      period: body.period || "MONTHLY",
      startDate: body.startDate || new Date().toISOString().split("T")[0],
      endDate: body.endDate || null,
      categories: Array.isArray(cats) ? cats : [],
      description: body.description || "",
      comments: body.comments || "",
    };
    store.budgets = [row, ...store.budgets];
    recalculateBudgetSpent(store);
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  const budgetId = matchBudgetId(path);
  if (
    method === "GET" &&
    budgetId &&
    budgetId !== "overview" &&
    path.startsWith("/api/budgets/")
  ) {
    const b = store.budgets.find((x) => String(x.id) === String(budgetId));
    if (!b) return rejectDemoHttp(404, "Budget not found");
    return resolveDemoData(b);
  }

  if (method === "PUT" && budgetId && budgetId !== "overview" && path.startsWith("/api/budgets/")) {
    const idx = store.budgets.findIndex((x) => String(x.id) === String(budgetId));
    if (idx === -1) return rejectDemoHttp(404, "Budget not found");
    const row = { ...store.budgets[idx], ...body, id: store.budgets[idx].id };
    store.budgets = [...store.budgets.slice(0, idx), row, ...store.budgets.slice(idx + 1)];
    recalculateBudgetSpent(store);
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  if (
    method === "DELETE" &&
    budgetId &&
    budgetId !== "overview" &&
    path.startsWith("/api/budgets/")
  ) {
    store.budgets = store.budgets.filter((x) => String(x.id) !== String(budgetId));
    saveDemoStore(store);
    return resolveDemoData({ success: true });
  }

  return null;
}
