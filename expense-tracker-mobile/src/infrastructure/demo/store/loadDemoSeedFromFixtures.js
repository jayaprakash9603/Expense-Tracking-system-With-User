import seedBlueprint from "@/infrastructure/demo/fixtures/seed.entities.json";
import { hydrateRelativeDates } from "@/infrastructure/demo/seed/hydrateRelativeDates";

export function buildHydratedSeedStore() {
  const hydrated = hydrateRelativeDates(seedBlueprint);
  return {
    expenses: Array.isArray(hydrated.expenses) ? hydrated.expenses : [],
    budgets: Array.isArray(hydrated.budgets) ? hydrated.budgets : [],
    bills: Array.isArray(hydrated.bills) ? hydrated.bills : [],
    categories: Array.isArray(hydrated.categories) ? hydrated.categories : [],
    friends: Array.isArray(hydrated.friends) ? hydrated.friends : [],
    friendRequests: Array.isArray(hydrated.friendRequests) ? hydrated.friendRequests : [],
    paymentMethods: Array.isArray(hydrated.paymentMethods) ? hydrated.paymentMethods : [],
    groups: Array.isArray(hydrated.groups) ? hydrated.groups : [],
    profile: null,
    userSettings: hydrated.userSettings && typeof hydrated.userSettings === "object"
      ? hydrated.userSettings
      : null,
    nextId: typeof hydrated.nextId === "number" ? hydrated.nextId : 2000,
  };
}
