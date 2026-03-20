import { getAppConfig } from "@/config/runtime/parseAppConfig";

export function buildDefaultDemoProfile(store, overrides = {}) {
  const cfg = getAppConfig();
  const base = {
    id: 1,
    email: cfg.demoEmail,
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    mobile: "",
    occupation: "",
    location: "",
    bio: "",
    dateOfBirth: "",
    profileImage: "",
    coverImage: "",
    currentMode: "ADMIN",
    role: "ADMIN",
    ...overrides,
  };
  if (store.profile && typeof store.profile === "object") {
    return { ...base, ...store.profile };
  }
  return base;
}
