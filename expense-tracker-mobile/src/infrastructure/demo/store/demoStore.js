import { STORAGE_KEYS } from "@/config/constants";
import { getAppConfig } from "@/config/runtime/parseAppConfig";
import { recalculateBudgetSpent } from "@/infrastructure/demo/domain/demoBudgetAccounting";
import { buildHydratedSeedStore } from "@/infrastructure/demo/store/loadDemoSeedFromFixtures";

function emptyStore() {
  return {
    expenses: [],
    budgets: [],
    bills: [],
    categories: [],
    friends: [],
    friendRequests: [],
    paymentMethods: [],
    groups: [],
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
      paymentMethods: Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : [],
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
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
  const store =
    demoSeedScenario === "empty" ? emptyStore() : { ...emptyStore(), ...buildHydratedSeedStore() };
  if (demoSeedScenario !== "empty") {
    recalculateBudgetSpent(store);
  }
  writeRaw(store);
  return loadDemoStore();
}

export function nextDemoId(store) {
  const n = Number(store.nextId) || 1000;
  store.nextId = n + 1;
  return `demo-${n}`;
}
