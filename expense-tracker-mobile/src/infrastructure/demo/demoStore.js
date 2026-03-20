import { STORAGE_KEYS } from "@/config/constants";
import { getAppConfig } from "@/config/runtime/parseAppConfig";

function emptyStore() {
  return {
    expenses: [],
    budgets: [],
    bills: [],
    categories: [],
    friends: [],
    friendRequests: [],
    profile: null,
    userSettings: null,
    nextId: 1000,
  };
}

function readRaw() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.DEMO_STORE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeRaw(store) {
  sessionStorage.setItem(STORAGE_KEYS.DEMO_STORE, JSON.stringify(store));
}

export function loadDemoStore() {
  const parsed = readRaw();
  if (parsed && typeof parsed === "object") {
    return {
      ...emptyStore(),
      ...parsed,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      bills: Array.isArray(parsed.bills) ? parsed.bills : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      friends: Array.isArray(parsed.friends) ? parsed.friends : [],
      friendRequests: Array.isArray(parsed.friendRequests) ? parsed.friendRequests : [],
    };
  }
  return emptyStore();
}

export function saveDemoStore(store) {
  writeRaw(store);
}

export function clearDemoStore() {
  sessionStorage.removeItem(STORAGE_KEYS.DEMO_STORE);
}

export function ensureDemoStoreSeeded() {
  const { isDemo, demoSeedScenario } = getAppConfig();
  if (!isDemo) return loadDemoStore();
  const existing = readRaw();
  if (existing) return loadDemoStore();
  const store = demoSeedScenario === "empty" ? emptyStore() : buildSampleStore();
  writeRaw(store);
  return loadDemoStore();
}

function buildSampleStore() {
  const catFood = {
    id: "demo-cat-1",
    name: "Food",
    color: "#14b8a6",
    type: "NEED",
  };
  const catTransport = {
    id: "demo-cat-2",
    name: "Transport",
    color: "#6366f1",
    type: "NEED",
  };
  const e1 = {
    id: "demo-exp-1",
    name: "Groceries",
    amount: 48.5,
    date: new Date().toISOString().split("T")[0],
    categoryId: catFood.id,
    categoryName: catFood.name,
    category: catFood.name,
    type: "NEED",
    paymentMethod: "CARD",
    comments: "",
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const e2 = {
    id: "demo-exp-2",
    name: "Transit",
    amount: 12,
    date: new Date().toISOString().split("T")[0],
    categoryId: catTransport.id,
    categoryName: catTransport.name,
    category: catTransport.name,
    type: "NEED",
    paymentMethod: "CASH",
    comments: "",
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const b1 = {
    id: "demo-bud-1",
    name: "Monthly",
    amount: 800,
    spent: 60.5,
    period: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
    categories: [],
  };
  const bill1 = {
    id: "demo-bill-1",
    title: "Utilities",
    amount: 95,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    status: "PENDING",
    category: "Bills",
  };
  return {
    expenses: [e1, e2],
    budgets: [b1],
    bills: [bill1],
    categories: [catFood, catTransport],
    friends: [],
    friendRequests: [],
    profile: null,
    userSettings: {
      themeMode: "dark",
      dateFormat: "DD/MM/YYYY",
      currency: "USD",
      twoFactorEnabled: false,
    },
    nextId: 2000,
  };
}

export function nextDemoId(store) {
  const n = Number(store.nextId) || 1000;
  store.nextId = n + 1;
  return `demo-${n}`;
}
