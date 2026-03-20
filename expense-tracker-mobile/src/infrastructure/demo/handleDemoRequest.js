import { getAppConfig } from "@/config/runtime/parseAppConfig";
import {
  ensureDemoStoreSeeded,
  saveDemoStore,
  nextDemoId,
} from "@/infrastructure/demo/demoStore";
import { buildDemoAnalyticsOverview } from "@/infrastructure/demo/demoAnalyticsBuilder";
import { buildDefaultDemoProfile } from "@/infrastructure/demo/demoProfile";
import {
  normalizeRequestPath,
  parseRequestBody,
  rejectDemoHttp,
  resolveDemoData,
} from "@/infrastructure/demo/demoHttpUtils";

const DEMO_JWT_PREFIX = "expensio-demo-token";

function buildDemoJwt() {
  return `${DEMO_JWT_PREFIX}.${Date.now()}`;
}

function matchExpenseIdFromDetailed(path) {
  const m = path.match(/^\/api\/expenses\/expense\/([^/]+)\/detailed$/);
  return m ? m[1] : null;
}

function matchExpenseEdit(path) {
  const m = path.match(/^\/api\/expenses\/edit-expense\/([^/]+)$/);
  return m ? m[1] : null;
}

function matchExpenseDelete(path) {
  const m = path.match(/^\/api\/expenses\/delete\/([^/]+)$/);
  return m ? m[1] : null;
}

function matchBudgetId(path) {
  const m = path.match(/^\/api\/budgets\/([^/]+)$/);
  return m ? m[1] : null;
}

function matchBillId(path) {
  const m = path.match(/^\/api\/bills\/([^/]+)$/);
  return m ? m[1] : null;
}

function matchCategoryId(path) {
  const m = path.match(/^\/api\/categories\/([^/]+)$/);
  return m ? m[1] : null;
}

function mapExpenseOut(e, categories) {
  const cat = categories.find((c) => c.id === e.categoryId);
  return {
    ...e,
    category: cat
      ? { id: cat.id, name: cat.name, color: cat.color, type: cat.type }
      : e.categoryName || "",
    expenseName: e.name,
  };
}

function buildCategoryDistribution(store) {
  const map = new Map();
  for (const e of store.expenses) {
    const label = e.categoryName || "Other";
    map.set(label, (map.get(label) || 0) + Number(e.amount || 0));
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

function buildPaymentMethodDistribution(store) {
  const map = new Map();
  for (const e of store.expenses) {
    const label = e.paymentMethod || "OTHER";
    map.set(label, (map.get(label) || 0) + Number(e.amount || 0));
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

function buildCashflowSeries(store) {
  const byDay = new Map();
  for (const e of store.expenses) {
    const d = (e.date || "").split("T")[0];
    if (!d) continue;
    byDay.set(d, (byDay.get(d) || 0) + Number(e.amount || 0));
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));
}

export async function handleDemoRequest(config) {
  const cfg = getAppConfig();
  if (!cfg.isDemo) {
    return rejectDemoHttp(500, "Demo adapter used outside demo mode");
  }

  const method = String(config.method || "get").toUpperCase();
  const path = normalizeRequestPath(config);
  const body = parseRequestBody(config);
  const store = ensureDemoStoreSeeded();

  try {
    if (method === "POST" && path === "/auth/signin") {
      const email = String(body.email || "").trim();
      const password = String(body.password || "");
      if (email === cfg.demoEmail && password === cfg.demoPassword) {
        return resolveDemoData({ jwt: buildDemoJwt() });
      }
      return rejectDemoHttp(401, "Invalid email or password.");
    }

    if (method === "POST" && path === "/auth/signup") {
      return resolveDemoData({ message: "Registered. Sign in with demo credentials.", success: true });
    }

    if (method === "POST" && path === "/auth/oauth2/google") {
      return resolveDemoData({ jwt: buildDemoJwt() });
    }

    if (method === "POST" && path === "/auth/check-email") {
      return resolveDemoData({ exists: false });
    }

    if (method === "POST" && path === "/auth/verify-login-otp") {
      return resolveDemoData({ jwt: buildDemoJwt() });
    }

    if (method === "GET" && path === "/api/user/profile") {
      return resolveDemoData(buildDefaultDemoProfile(store));
    }

    if (method === "PUT" && path === "/api/user/profile") {
      store.profile = { ...buildDefaultDemoProfile(store), ...body };
      saveDemoStore(store);
      return resolveDemoData(store.profile);
    }

    if (method === "PUT" && path === "/api/user/two-factor") {
      return resolveDemoData({ success: true });
    }

    if (method === "PUT" && path === "/api/user/switch-mode") {
      const mode = config.params?.mode || body.mode || "USER";
      store.profile = buildDefaultDemoProfile(store, { currentMode: mode });
      saveDemoStore(store);
      return resolveDemoData({ user: store.profile, currentMode: mode });
    }

    if (method === "GET" && path === "/api/settings/exists") {
      return resolveDemoData(true);
    }

    if (method === "GET" && path === "/api/settings") {
      const settings = store.userSettings || {
        themeMode: "dark",
        dateFormat: "DD/MM/YYYY",
        currency: "USD",
        twoFactorEnabled: false,
      };
      store.userSettings = settings;
      saveDemoStore(store);
      return resolveDemoData(settings);
    }

    if (method === "PUT" && path === "/api/settings") {
      store.userSettings = { ...(store.userSettings || {}), ...body };
      saveDemoStore(store);
      return resolveDemoData(store.userSettings);
    }

    if (method === "POST" && path === "/api/settings/default") {
      store.userSettings = {
        themeMode: "dark",
        dateFormat: "DD/MM/YYYY",
        currency: "USD",
        twoFactorEnabled: false,
      };
      saveDemoStore(store);
      return resolveDemoData(store.userSettings);
    }

    if (method === "POST" && path === "/api/settings/reset") {
      return resolveDemoData(store.userSettings || {});
    }

    if (method === "GET" && path === "/api/analytics/overview") {
      return resolveDemoData(buildDemoAnalyticsOverview(store));
    }

    if (method === "POST" && path === "/api/analytics/entity") {
      return resolveDemoData({ series: [], totals: {} });
    }

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

    if (method === "POST" && path === "/api/expenses/add-expense") {
      const id = nextDemoId(store);
      const cat = store.categories.find(
        (c) => String(c.id) === String(body.categoryId || body.category),
      );
      const row = {
        id,
        name: body.name || body.itemName || "Expense",
        amount: Number(body.amount || 0),
        date: (body.date || body.expenseDate || new Date().toISOString()).split("T")[0],
        categoryId: cat?.id || body.categoryId || "",
        categoryName: cat?.name || body.categoryName || "",
        category: cat?.name || body.categoryName || "",
        type: body.type || "NEED",
        paymentMethod: body.paymentMethod || "CASH",
        comments: body.comments || body.description || "",
        isRecurring: Boolean(body.isRecurring),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.expenses = [row, ...store.expenses];
      saveDemoStore(store);
      return resolveDemoData(row);
    }

    const editId = matchExpenseEdit(path);
    if (method === "PUT" && editId) {
      const idx = store.expenses.findIndex((e) => String(e.id) === String(editId));
      if (idx === -1) return rejectDemoHttp(404, "Expense not found");
      const prev = store.expenses[idx];
      const cat = store.categories.find(
        (c) => String(c.id) === String(body.categoryId || body.category),
      );
      const row = {
        ...prev,
        ...body,
        id: prev.id,
        name: body.name ?? prev.name,
        amount: body.amount != null ? Number(body.amount) : prev.amount,
        date: (body.date || prev.date || "").split("T")[0],
        categoryId: cat?.id ?? body.categoryId ?? prev.categoryId,
        categoryName: cat?.name ?? body.categoryName ?? prev.categoryName,
        category: cat?.name ?? prev.category,
        updatedAt: new Date().toISOString(),
      };
      store.expenses = [...store.expenses.slice(0, idx), row, ...store.expenses.slice(idx + 1)];
      saveDemoStore(store);
      return resolveDemoData(row);
    }

    const delId = matchExpenseDelete(path);
    if (method === "DELETE" && delId) {
      store.expenses = store.expenses.filter((e) => String(e.id) !== String(delId));
      saveDemoStore(store);
      return resolveDemoData({ success: true });
    }

    if (method === "GET" && path === "/api/expenses/cashflow") {
      return resolveDemoData(buildCashflowSeries(store));
    }

    if (method === "GET" && path === "/api/expenses/summary-expenses") {
      const total = store.expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
      return resolveDemoData({ totalAmount: total, count: store.expenses.length });
    }

    if (
      (method === "POST" || method === "GET") &&
      path === "/api/expenses/top-expense-names"
    ) {
      const topExpenses = store.expenses.map((e) => ({
        name: e.name,
        expenseName: e.name,
      }));
      return resolveDemoData({ topExpenses, data: topExpenses, items: topExpenses });
    }

    if (method === "GET" && path === "/api/expenses/groupedByDate") {
      return resolveDemoData([]);
    }

    if (method === "GET" && path === "/api/expenses/all-by-categories/detailed/filtered") {
      return resolveDemoData(buildCategoryDistribution(store));
    }

    if (method === "GET" && path === "/api/expenses/all-by-payment-method/detailed/filtered") {
      return resolveDemoData(buildPaymentMethodDistribution(store));
    }

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

    if (method === "POST" && path === "/api/budgets") {
      const id = nextDemoId(store);
      const row = {
        id,
        name: body.name || "Budget",
        amount: Number(body.amount || 0),
        spent: 0,
        period: body.period || "MONTHLY",
        startDate: body.startDate || new Date().toISOString().split("T")[0],
        endDate: body.endDate || null,
        categories: body.categories || [],
      };
      store.budgets = [row, ...store.budgets];
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

    if (method === "GET" && path === "/api/bills") {
      return resolveDemoData([...store.bills]);
    }

    if (method === "GET" && path === "/api/bills/upcoming") {
      return resolveDemoData([...store.bills]);
    }

    if (method === "POST" && path === "/api/bills") {
      const id = nextDemoId(store);
      const row = {
        id,
        title: body.title || body.name || "Bill",
        amount: Number(body.amount || 0),
        dueDate: body.dueDate || new Date().toISOString().split("T")[0],
        status: body.status || "PENDING",
        category: body.category || "",
      };
      store.bills = [row, ...store.bills];
      saveDemoStore(store);
      return resolveDemoData(row);
    }

    const billId = matchBillId(path);
    if (
      method === "PUT" &&
      billId &&
      billId !== "upcoming" &&
      path.startsWith("/api/bills/")
    ) {
      const idx = store.bills.findIndex((x) => String(x.id) === String(billId));
      if (idx === -1) return rejectDemoHttp(404, "Bill not found");
      const row = { ...store.bills[idx], ...body, id: store.bills[idx].id };
      store.bills = [...store.bills.slice(0, idx), row, ...store.bills.slice(idx + 1)];
      saveDemoStore(store);
      return resolveDemoData(row);
    }

    if (
      method === "DELETE" &&
      billId &&
      billId !== "upcoming" &&
      path.startsWith("/api/bills/")
    ) {
      store.bills = store.bills.filter((x) => String(x.id) !== String(billId));
      saveDemoStore(store);
      return resolveDemoData({ success: true });
    }

    if (method === "PATCH" && path.includes("/pay")) {
      const m = path.match(/^\/api\/bills\/([^/]+)\/pay$/);
      const id = m ? m[1] : null;
      if (!id) return rejectDemoHttp(400, "Bad request");
      const idx = store.bills.findIndex((x) => String(x.id) === String(id));
      if (idx === -1) return rejectDemoHttp(404, "Bill not found");
      const row = { ...store.bills[idx], status: "PAID" };
      store.bills = [...store.bills.slice(0, idx), row, ...store.bills.slice(idx + 1)];
      saveDemoStore(store);
      return resolveDemoData(row);
    }

    if (method === "GET" && path === "/api/categories") {
      return resolveDemoData([...store.categories]);
    }

    if (method === "POST" && path === "/api/categories") {
      const id = nextDemoId(store);
      const row = {
        id,
        name: body.name || "Category",
        color: body.color || "#64748b",
        type: body.type || "NEED",
      };
      store.categories = [...store.categories, row];
      saveDemoStore(store);
      return resolveDemoData(row);
    }

    const catId = matchCategoryId(path);
    if (method === "PUT" && catId) {
      const idx = store.categories.findIndex((x) => String(x.id) === String(catId));
      if (idx === -1) return rejectDemoHttp(404, "Category not found");
      const row = { ...store.categories[idx], ...body, id: store.categories[idx].id };
      store.categories = [
        ...store.categories.slice(0, idx),
        row,
        ...store.categories.slice(idx + 1),
      ];
      saveDemoStore(store);
      return resolveDemoData(row);
    }

    if (method === "DELETE" && catId) {
      store.categories = store.categories.filter((x) => String(x.id) !== String(catId));
      saveDemoStore(store);
      return resolveDemoData({ success: true });
    }

    if (method === "GET" && path === "/api/friendships/friends") {
      return resolveDemoData([...store.friends]);
    }

    if (method === "GET" && path === "/api/friendships/suggestions") {
      return resolveDemoData([]);
    }

    if (method === "GET" && path === "/api/friendships/pending/incoming") {
      return resolveDemoData([...store.friendRequests]);
    }

    if (method === "GET" && path === "/api/notifications/unread-count") {
      return resolveDemoData({ count: 0 });
    }

    if (
      method === "GET" &&
      path.startsWith("/api/notifications") &&
      path.includes("preferences")
    ) {
      return resolveDemoData({});
    }

    if (method === "GET" && path.startsWith("/api/notifications")) {
      return resolveDemoData([]);
    }

    if (method === "PATCH" && path.startsWith("/api/notifications")) {
      return resolveDemoData({ success: true });
    }

    if (method === "DELETE" && path.startsWith("/api/notifications")) {
      return resolveDemoData({ success: true });
    }

    if (method === "PUT" && path.startsWith("/api/notifications")) {
      return resolveDemoData({ success: true });
    }

    if (method === "POST" && path.startsWith("/api/notifications")) {
      return resolveDemoData({ success: true });
    }

    if (path.startsWith("/api/notification-preferences")) {
      return resolveDemoData({});
    }

    if (path.startsWith("/api/reports")) {
      return resolveDemoData({ labels: [], series: [], rows: [] });
    }

    if (method === "GET" && path === "/api/payment-methods") {
      return resolveDemoData([]);
    }

    if (path.startsWith("/api/payment-methods")) {
      return resolveDemoData({});
    }

    if (method === "GET" && path.startsWith("/api/groups")) {
      return resolveDemoData([]);
    }

    if (method === "POST" && path.startsWith("/api/groups")) {
      return resolveDemoData({ id: nextDemoId(store), name: body.name || "Group" });
    }

    return rejectDemoHttp(404, `Demo: no handler for ${method} ${path}`);
  } catch (e) {
    if (e?.response) return Promise.reject(e);
    return rejectDemoHttp(500, e?.message || "Demo error");
  }
}
